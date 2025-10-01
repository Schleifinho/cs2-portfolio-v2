using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.Contracts.Steam;
using CSPortfolioLib.DTOs.PriceHistory;
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
    .SetBasePath(AppContext.BaseDirectory) // optional if running from bin folder
    .AddJsonFile("./appsettings.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .Build();

builder.Services.AddRabbitMQConsumer(builder.Configuration,
    cfg =>
    {
        cfg.AddConsumer<PriceEventConsumer>();
    });

builder.Services.Configure<ApiSettings>(builder.Configuration.GetSection("ApiSettings"));
builder.Services
    .AddRefitClient<ISteamMarketPriceApi>()
    .ConfigureHttpClient(c => c.BaseAddress = new Uri("https://steamcommunity.com"));

builder.Services
    .AddRefitClient<IPriceHistoryApi>()
    .ConfigureHttpClient(c => c.BaseAddress = new Uri("http://csportfolioapi:8080/api"));

builder.Services.AddSingleton<ThrottledSteamMarketService>();
builder.Services.AddSingleton<SteamPriceService>();

var app = builder.Build();

/*
string apiBaseUrl = "https://steamcommunity.com";
var api = RestService.For<ISteamMarketPriceApi>($"{apiBaseUrl}");
var response = await api.GetMarketPriceAsync(730, "Revolution Case", 3);
Console.WriteLine(response.Content.Volume);
*/
app.Run();