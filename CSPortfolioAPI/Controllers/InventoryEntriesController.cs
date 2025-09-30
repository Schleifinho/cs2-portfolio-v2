using AutoMapper;
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
        return Ok(await repository.GetAllCompleteAsync());
    }
}    