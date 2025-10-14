using System.Net;
using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.Contracts.Steam;
using CSPortfolioLib.DTOs.PriceHistory;
using CSPriceUpdater.Extensions;
using Microsoft.Extensions.Logging;

namespace CSPriceUpdater.Services;

public class ThrottledSteamMarketService(ILogger<ThrottledSteamMarketService> logger, IPriceHistoryApi priceApi, ISteamMarketPriceApi api)
{
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private readonly TimeSpan _delay = TimeSpan.FromSeconds(6); 

    public async Task<bool> GetItemPriceAsync(int appId, int itemId, string marketHashName)
    {
        await _semaphore.WaitAsync();
        try
        {
            var result = await api.GetMarketPriceAsync(appId, marketHashName, 3);
            if (result.IsSuccessful == false)
            {
                if (result.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    logger.LogInformation($"Too Many RequestsGetMarketPriceAsync returned {result.StatusCode} ");
                    Thread.Sleep(TimeSpan.FromMinutes(1));
                }
                throw new Exception($"Error getting market price for {marketHashName}: {result}");
            }

            if (result.Content.LowestPrice.TryParseSteamPrice(out var lowPrice) == false)
            {
                return false;
            }

            var priceDto = new PriceHistoryDto()
                {
                    ItemId = itemId,
                    Price = lowPrice,
                    TimeStamp = DateTime.UtcNow
                };
            var priceUpdateResult = await priceApi.PostPriceHistoryAsync(priceDto);

            if (priceUpdateResult.IsSuccessful == false)
            {
                throw new Exception($"Error posting market price for {priceUpdateResult.Error?.Message}: {priceUpdateResult}");
            }
            
            await Task.Delay(_delay); // enforce delay between calls
            return priceUpdateResult.IsSuccessful;
        }
        finally
        {
            _semaphore.Release();
        }
    }
}