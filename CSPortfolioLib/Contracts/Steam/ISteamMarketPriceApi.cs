using CSPortfolioLib.DTOs.Steam;
using FluentResults;
using Refit;

namespace CSPortfolioLib.Contracts.Steam;

public interface ISteamMarketPriceApi
{
    [Get("/market/priceoverview/")]
    Task<ApiResponse<MarketPriceResponseDto>> GetMarketPriceAsync([Query] int appid, [Query, AliasAs("market_hash_name")] string marketHashName, [Query] int currency);
}