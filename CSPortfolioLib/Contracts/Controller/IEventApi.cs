using Microsoft.AspNetCore.Mvc;
using Refit;

namespace CSPortfolioLib.Contracts.Controller;


public interface IEventApi
{
    [Get("/priceupdate/all")]
    Task<ActionResult<int>> PublishAllAsync();
}