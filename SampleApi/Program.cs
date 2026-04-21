using SampleApi.Endpoints;
using SampleApi.Models;
using SampleApi.Records;
using SampleApi.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:4200", "http://localhost:4208")
              .AllowAnyHeader()
              .AllowAnyMethod()));

var dataPath = Environment.GetEnvironmentVariable("DATA_PATH")
    ?? Path.Combine(AppContext.BaseDirectory, ".data");
builder.Services.AddSingleton(_ => new JsonRepository<Hero>(Path.Combine(dataPath, "heroes.json")));
builder.Services.AddSingleton(_ => new JsonRepository<Power>(Path.Combine(dataPath, "powers.json")));
builder.Services.AddSingleton<IEntityService<HeroRequest, HeroResponse>, HeroService>();
builder.Services.AddSingleton<IEntityService<PowerRequest, PowerResponse>, PowerService>();

var app = builder.Build();

app.UseCors();
app.MapOpenApi();
app.MapScalarApiReference();

app.MapHeroEndpoints();
app.MapPowerEndpoints();

app.Run();
