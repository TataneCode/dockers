using SampleApi.Endpoints;
using SampleApi.Application.Services;
using SampleApi.Infrastructure;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200", "http://localhost:4208")
              .AllowAnyHeader()
              .AllowAnyMethod()));

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<IHeroService, HeroService>();
builder.Services.AddScoped<IPowerService, PowerService>();

var app = builder.Build();

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapHeroEndpoints();
app.MapPowerEndpoints();

app.Run();
