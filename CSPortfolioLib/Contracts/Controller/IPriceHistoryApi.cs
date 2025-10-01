using CSPortfolioLib.DTOs.Item;
using CSPortfolioLib.DTOs.PriceHistory;
using Refit;

namespace CSPortfolioLib.Contracts.Controller;

public interface IPriceHistoryApi
{
    [Post("/pricehistories")]
    Task<ApiResponse<PriceHistoryDto>> PostPriceHistoryAsync([Body] PriceHistoryDto item);
}