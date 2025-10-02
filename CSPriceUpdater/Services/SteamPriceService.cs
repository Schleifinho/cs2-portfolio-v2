using CSPortfolioLib.Contracts.Controller;
using Microsoft.Extensions.Logging;

namespace CSPriceUpdater.Services;

public class SteamPriceService(ILogger<SteamPriceService> logger, ThrottledSteamMarketService steamMarketService)
{
    public async Task<bool> ProcessPrices(string marketHashName, int itemId)
    {
        return await steamMarketService.GetItemPriceAsync(730, itemId, marketHashName);
    }
}