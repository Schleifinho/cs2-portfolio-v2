using CSPortfolioLib.Events;
using MessageBrokerLib.Contracts.Consumers;
using Microsoft.Extensions.Logging;

namespace CSPriceUpdater.Services;

public class PriceEventConsumer(ILogger<PriceEventConsumer> logger, SteamPriceService steamMarketService) : AbstractMassTransitConsumer<PriceUpdateEvent> (logger)
{
    protected override async Task HandleMessage(PriceUpdateEvent message)
    {
        Logger.LogInformation($"Consumed PriceUpdateEvent: {message.MarketHashName} ItemId={message.ItemId}");
    
        var result = await steamMarketService.ProcessPrices(message.MarketHashName, message.ItemId);
        Logger.LogInformation($"Consumed PriceUpdateEvent: {message.MarketHashName} Result: {result}");
    }
}