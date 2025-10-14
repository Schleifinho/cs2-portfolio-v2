using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.Contracts.Steam;
using CSPortfolioLib.Extensions;
using CSPortfolioLib.Options;
using CSPriceUpdater.Options;
using CSPriceUpdater.Services;
using CSPriceUpdater.Worker;
using MessageBrokerLib.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Configuration
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

builder.Services.AddRabbitMQConsumer(builder.Configuration,
    cfg =>
    {
        cfg.AddConsumer<PriceEventConsumer>();
    });

builder.Services.Configure<ApiSettings>(builder.Configuration.GetSection(nameof(ApiSettings)))
    .Configure<ApiSettings>(builder.Configuration.GetSection(nameof(WorkerTimerSettings)));
builder.Services.AddApiRefitClient<IPriceHistoryApi>()
    .AddSteamRefitClient<ISteamMarketPriceApi>()
    .AddSingleton<ThrottledSteamMarketService>()
    .AddSingleton<SteamPriceService>();
    
var enablePriceRefresh = builder.Configuration.GetValue("ENABLE_PRICE_REFRESH", false);
if (enablePriceRefresh)
{
    Console.WriteLine("Enable Price Refresh");
    builder.Services.AddHostedService<PriceRefreshWorker>()
        .AddApiRefitClient<IEventApi>("event")
        .AddScoped<PriceRefreshService>();
}
else
{
    Console.WriteLine("Disabled Price Refresh");
}

var app = builder.Build();
await app.RunAsync();