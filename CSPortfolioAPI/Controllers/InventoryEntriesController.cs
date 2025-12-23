using AutoMapper;
using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Models.Views;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Inventory;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryEntriesController (ILogger<InventoryEntriesController> logger, InventoryEntryRepository repository, UserManager<User> userManager, IMapper mapper)
    : BaseUserSecureController<InventoryEntryDto, InventoryEntry>(logger, repository, userManager, mapper)
{
    [HttpGet("complete")]

    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetAllCompleteAsync()
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        var result = await repository.GetAllCompleteAsync(userId);
        return result.ToActionResult();
    }
    
    [HttpGet("complete/top/{count}")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetTopCompleteAsync([FromRoute] int count)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        var result = await repository.GetTopCompleteAsync(userId, count);
        return result.ToActionResult();
    }
    
    [HttpGet("complete/bottom/{count}")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetBottomCompleteAsync([FromRoute] int count)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        var result = await repository.GetBottomCompleteAsync(userId, count);
        return result.ToActionResult();
    }
    
    [HttpGet("total/value")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetTotalValue()
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        return Ok(await repository.GetTotalValue(userId));
    }
    
    [HttpGet("total/items")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetTotalItems()
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        return Ok(await repository.GetTotalEntriesCount(userId));
    }
    
    [HttpGet("total/uniqueitems")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetTotalUniqueItems()
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        return Ok(await repository.GetUniqueEntriesCount(userId));
    }
    
    [HttpGet("dashboard/sumary")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetDashboardSummary()
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        return Ok(await repository.GetUniqueEntriesCount(userId));
    }
}    