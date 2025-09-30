using CSPortfolioLib.DTOs.Item;
using Refit;

namespace CSPortfolioLib.Contracts.Controller;

public interface IItemApi
{
    [Post("/items")]
    Task PostItemAsync([Body] ItemDto item);
}