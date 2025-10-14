using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashBoardController (ILogger<DashBoardController> logger, DashBoardRepository repository)
    : ControllerBase
{
    [HttpGet("summary")]

    public async Task<ActionResult<DashBoardNumbersDto>> GetDashBoardSummary([FromQuery] DateTimeOffset startDate)
    {
        logger.LogInformation("GetDashBoardSummary");
        var result = await repository.GetDashBoardNumbers(startDate);
        return result.ToActionResult();
    }
}    