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
public class InventoryEntriesController (ILogger<InventoryEntriesController> logger, InventoryEntryRepository repository, IMapper mapper)
    : BaseController<InventoryEntryDto, InventoryEntry>(logger, repository, mapper)
{
    [HttpGet("complete")]

    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetAllCompleteAsync()
    {
        var result = await repository.GetAllCompleteAsync();
        return result.ToActionResult();
    }
    
    [HttpGet("complete/top/{count}")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetTopCompleteAsync([FromRoute] int count)
    {
        var result = await repository.GetTopCompleteAsync(count);
        return result.ToActionResult();
    }
    
    [HttpGet("complete/bottom/{count}")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetBottomCompleteAsync([FromRoute] int count)
    {
        var result = await repository.GetBottomCompleteAsync(count);
        return result.ToActionResult();
    }
    
    [HttpGet("total/value")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetTotalValue()
    {
        return Ok(await repository.GetTotalValue());
    }
    
    [HttpGet("total/items")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetTotalItems()
    {
        return Ok(await repository.GetTotalEntriesCount());
    }
    
    [HttpGet("total/uniqueitems")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetTotalUniqueItems()
    {
        return Ok(await repository.GetUniqueEntriesCount());
    }
    
    [HttpGet("dashboard/sumary")]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetDashboardSummary()
    {
        return Ok(await repository.GetUniqueEntriesCount());
    }
}    