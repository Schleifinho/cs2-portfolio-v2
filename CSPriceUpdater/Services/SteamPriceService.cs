using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.DTOs.PriceHistory;
using CSPriceUpdater.Extensions;
using FluentResults;
using Microsoft.Extensions.Logging;

namespace CSPriceUpdater.Services;

public class SteamPriceService(ILogger<SteamPriceService> logger, IPriceHistoryApi priceApi, ThrottledSteamMarketService steamMarketService)
{
    public async Task<bool> ProcessPrices(string marketHashName, int itemId)
    {
        var priceResult = await steamMarketService.GetItemPriceAsync(730, marketHashName);
        if (priceResult.Success)
        {
            if (priceResult.LowestPrice.TryParseSteamPrice(out var lowPrice))
            {
                var priceDto = new PriceHistoryDto()
                {
                    ItemId = itemId,
                    Price = lowPrice,
                    TimeStamp = DateTime.UtcNow
                };
                var result = await priceApi.PostPriceHistoryAsync(priceDto);
                return result.IsSuccessful;
            }
            logger.LogError($"Price not found for {marketHashName}");
        }
        logger.LogError($"EEEE Price not found for {marketHashName}");
        return false;
    }
}