using CSPortfolioLib.DTOs.Item;
using Refit;

namespace CSPortfolioLib.Contracts.Controller;

public interface IItemApi
{
    [Post("/items")]
    Task PostItemAsync([Body] ItemDto item);
    
    [Put("/items")]
    Task<ApiResponse<ItemDto>> UpdateAsync([Body] ItemDto item);
    
    [Get("/items/noicon")]
    Task<ApiResponse<List<ItemDto>>> GetItemWithoutIconAsync();
}