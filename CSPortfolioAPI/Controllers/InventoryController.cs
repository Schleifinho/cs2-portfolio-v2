using CSPortfolioAPI.Models.Views;
using CSPortfolioAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController(ILogger<InventoryController> logger,
    InventoryEntryRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryEntryView>>> GetAllEntriesAsync()
    {
        var inventoryEntries = await repository.GetAllCompleteAsync();
        return Ok(inventoryEntries);
    }
}