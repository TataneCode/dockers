use std::fs;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use opentelemetry::metrics::{Meter, MeterProvider as _};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_sdk::metrics::{PeriodicReader, SdkMeterProvider};
use opentelemetry_sdk::runtime::Tokio as SdkRuntime;

fn read_proc_statm() -> Option<(u64, u64)> {
    let content = fs::read_to_string("/proc/self/statm").ok()?;
    let mut fields = content.split_whitespace();
    let virtual_bytes = fields.next()?.parse::<u64>().ok()?;
    let rss_bytes = fields.next()?.parse::<u64>().ok()?;
    Some((virtual_bytes * 4096, rss_bytes * 4096))
}

fn read_proc_status_rss() -> Option<u64> {
    let content = fs::read_to_string("/proc/self/status").ok()?;
    for line in content.lines() {
        if let Some(rest) = line.strip_prefix("VmRSS:") {
            let kb: u64 = rest.trim().trim_end_matches("kB").trim().parse().ok()?;
            return Some(kb * 1024);
        }
    }
    None
}

fn read_proc_cpu_seconds() -> Option<f64> {
    let content = fs::read_to_string("/proc/self/stat").ok()?;
    let rest = content.rsplit_once(')')?.1;
    let fields: Vec<&str> = rest.split_whitespace().collect();
    if fields.len() < 13 {
        return None;
    }
    let utime: f64 = fields[11].parse().ok()?;
    let stime: f64 = fields[12].parse().ok()?;
    Some((utime + stime) / 100.0)
}

fn total_cpu_seconds_since_boot() -> f64 {
    let content = fs::read_to_string("/proc/stat").ok();
    let total: Option<f64> = content.and_then(|stat| {
        for line in stat.lines() {
            if let Some(rest) = line.strip_prefix("cpu ") {
                return rest
                    .split_whitespace()
                    .filter_map(|v| v.parse::<f64>().ok())
                    .sum::<f64>()
                    .into();
            }
        }
        None
    });
    total.unwrap_or(0.0) / 100.0
}

fn register_memory_gauges(meter: &Meter) {
    meter
        .u64_observable_gauge("process.memory.usage")
        .with_description("Process resident memory (RSS) in bytes")
        .with_unit("By")
        .with_callback(|observer| {
            let rss = read_proc_status_rss()
                .or_else(|| read_proc_statm().map(|(_, rss)| rss))
                .unwrap_or(0);
            observer.observe(rss, &[]);
        })
        .build();
}

fn register_virtual_memory_gauge(meter: &Meter) {
    meter
        .u64_observable_gauge("process.memory.virtual")
        .with_description("Process virtual memory in bytes")
        .with_unit("By")
        .with_callback(|observer| {
            let virtual_bytes = read_proc_statm().map(|(v, _)| v).unwrap_or(0);
            observer.observe(virtual_bytes, &[]);
        })
        .build();
}

fn register_cpu_time_gauge(meter: &Meter) {
    meter
        .f64_observable_gauge("process.cpu.time")
        .with_description("Process CPU time in seconds")
        .with_unit("s")
        .with_callback(|observer| {
            let cpu_seconds = read_proc_cpu_seconds().unwrap_or(0.0);
            observer.observe(cpu_seconds, &[]);
        })
        .build();
}

fn register_cpu_utilization_gauge(meter: &Meter) {
    let last = Mutex::new((read_proc_cpu_seconds().unwrap_or(0.0), total_cpu_seconds_since_boot()));
    meter
        .f64_observable_gauge("process.cpu.utilization")
        .with_description("Process CPU utilization (0 to 1)")
        .with_unit("{utilization}")
        .with_callback(move |observer| {
            let Ok(mut guard) = last.lock() else { return };
            let (cpu0, wall0) = *guard;
            let cpu1 = read_proc_cpu_seconds().unwrap_or(cpu0);
            let wall1 = total_cpu_seconds_since_boot();
            *guard = (cpu1, wall1);
            let wall_delta = (wall1 - wall0).max(1e-6);
            let utilization = ((cpu1 - cpu0) / wall_delta).clamp(0.0, 1.0);
            observer.observe(utilization, &[]);
        })
        .build();
}

fn register_uptime_gauge(meter: &Meter, start: Instant) {
    meter
        .f64_observable_gauge("process.uptime")
        .with_description("Process uptime in seconds")
        .with_unit("s")
        .with_callback(move |observer| {
            observer.observe(start.elapsed().as_secs_f64(), &[]);
        })
        .build();
}

pub fn init_meter_provider(endpoint: &str) -> SdkMeterProvider {
    use opentelemetry_otlp::MetricExporter;

    let exporter = MetricExporter::builder()
        .with_tonic()
        .with_endpoint(endpoint)
        .build()
        .expect("Failed to build OTLP metric exporter");

    let reader = PeriodicReader::builder(exporter, SdkRuntime)
        .with_interval(Duration::from_secs(10))
        .build();

    let provider = SdkMeterProvider::builder()
        .with_reader(reader)
        .build();

    let meter = provider.meter("rust-api-process");
    let start = Instant::now();

    register_memory_gauges(&meter);
    register_virtual_memory_gauge(&meter);
    register_cpu_time_gauge(&meter);
    register_cpu_utilization_gauge(&meter);
    register_uptime_gauge(&meter, start);

    opentelemetry::global::set_meter_provider(provider.clone());
    provider
}
