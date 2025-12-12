using System.Security.Claims;
using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[Authorize] 
[ApiController]
[Route("api/[controller]")]
public class DashBoardController (
    ILogger<DashBoardController> logger, 
    UserManager<User> userManager,
    DashBoardRepository repository)
    : ControllerBase
{
    [HttpGet("summary")]

    public async Task<ActionResult<DashBoardNumbersDto>> GetDashBoardSummary([FromQuery] DateTimeOffset startDate)
    {
        var userIdFromToken = userManager.GetUserId(User);
        if (userIdFromToken == null)
        {
            return Unauthorized("User not authenticated.");
        }
        logger.LogInformation("GetDashBoardSummary");
        var result = await repository.GetDashBoardNumbers(userIdFromToken, startDate);
        return result.ToActionResult();
    }
}    