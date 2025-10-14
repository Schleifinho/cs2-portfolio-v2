using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.Contracts.Steam;
using CSPortfolioLib.DTOs.PriceHistory;
using CSPortfolioLib.Extensions;
using CSPortfolioLib.Options;
using CSPriceUpdater.Services;
using FluentResults;
using MessageBrokerLib.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Refit;

var builder = Host.CreateApplicationBuilder(args);
builder.Configuration
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

builder.Services.AddRabbitMQConsumer(builder.Configuration,
    cfg =>
    {
        cfg.AddConsumer<PriceEventConsumer>();
    });

builder.Services.Configure<ApiSettings>(builder.Configuration.GetSection("ApiSettings"));
builder.Services.AddApiRefitClient<IPriceHistoryApi>()
    .AddSteamRefitClient<ISteamMarketPriceApi>()
    .AddSingleton<ThrottledSteamMarketService>()
    .AddSingleton<SteamPriceService>();

var app = builder.Build();
app.Run();