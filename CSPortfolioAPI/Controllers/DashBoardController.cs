using AutoMapper;
using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Models.Views;
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
        var result = await repository.GetDashBoardNumbers(startDate);
        return result.ToActionResult();
    }
}    