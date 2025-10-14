using CSPortfolioLib.Contracts.Controller;
using Microsoft.Extensions.Logging;

namespace CSPriceUpdater.Services;

public class PriceRefreshService(IEventApi eventApi, ILogger<PriceRefreshService> logger)
{
    public async Task RefreshAllPricesAsync()
    {
        logger.LogInformation("Refreshing all prices");
        await eventApi.PublishAllAsync();
        logger.LogInformation("Done");
    }
}