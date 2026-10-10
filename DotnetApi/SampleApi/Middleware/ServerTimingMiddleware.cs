using System.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace SampleApi.Middleware;

public sealed class ServerTimingMiddleware
{
    private readonly RequestDelegate _next;

    public ServerTimingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        context.Response.OnStarting(() =>
        {
            stopwatch.Stop();
            context.Response.Headers["Server-Timing"] = $"app;dur={stopwatch.Elapsed.TotalMilliseconds:F1}";
            return Task.CompletedTask;
        });
        await _next(context);
    }
}
