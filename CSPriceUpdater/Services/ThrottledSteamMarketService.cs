using CSPortfolioLib.Contracts.Steam;
using CSPortfolioLib.DTOs.Steam;
using Microsoft.Extensions.Logging;

namespace CSPriceUpdater.Services;

public class ThrottledSteamMarketService(ILogger<ThrottledSteamMarketService> logger, ISteamMarketPriceApi api)
{
    private readonly SemaphoreSlim _semaphore = new(1, 1); // only 1 call at a time
    private readonly TimeSpan _delay = TimeSpan.FromSeconds(5); // 2 calls/sec

    public async Task<MarketPriceResponseDto> GetItemPriceAsync(int appId, string marketHashName)
    {
        await _semaphore.WaitAsync();
        try
        {
            var result = await api.GetMarketPriceAsync(appId, marketHashName, 3);
            if (result.IsSuccessful == false)
                throw new Exception($"Error getting market price for {marketHashName}: {result}");

            await Task.Delay(_delay); // enforce delay between calls
            return result.Content;
        }
        finally
        {
            _semaphore.Release();
        }
    }
}