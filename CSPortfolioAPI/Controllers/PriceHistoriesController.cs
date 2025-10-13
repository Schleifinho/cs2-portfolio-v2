using AutoMapper;
using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.PriceHistory;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PriceHistoriesController (ILogger<PriceHistoriesController> logger, PriceHistoryRepository repository, IMapper mapper)
    : BaseController<PriceHistoryDto, PriceHistory>(logger, repository, mapper)
{
    [HttpGet("byItemId/itemId")]
    public async Task<ActionResult<List<PriceHistoryDto>>> GetPriceHistoriesByItemId([FromRoute]int itemId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await repository.GetByItemId(itemId, startDate, endDate);
        return result.ToActionResult();
    }
}