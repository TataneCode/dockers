using SampleApi.Endpoints;
using SampleApi.Application.Services;
using SampleApi.Middleware;
using SampleApi.Infrastructure;
using Scalar.AspNetCore;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

var otlpEndpoint = builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]
    ?? "http://localhost:4317";
var serviceName = builder.Configuration["OTEL_SERVICE_NAME"]
    ?? "sample-api";

builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService(serviceName))
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint)))
    .WithLogging(l => l
        .AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint)))
    .WithMetrics(m => m
        .AddProcessInstrumentation()
        .AddRuntimeInstrumentation()
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter(o => o.Endpoint = new Uri(otlpEndpoint)));

builder.Services.AddOpenApi();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<IHeroService, HeroService>();
builder.Services.AddScoped<IPowerService, PowerService>();
builder.Services.AddScoped<ISeedService, SeedService>();

var app = builder.Build();
app.UseMiddleware<ServerTimingMiddleware>();

app.MapOpenApi();
app.MapScalarApiReference("/docs");

app.MapHeroEndpoints();
app.MapPowerEndpoints();
app.MapSeedEndpoints();

app.Run();
