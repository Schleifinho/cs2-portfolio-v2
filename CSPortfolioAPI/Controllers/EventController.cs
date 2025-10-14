using CSPortfolioAPI.Repositories;
using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.Events;
using CSPortfolioLib.Producers;
using Microsoft.AspNetCore.Mvc;
using Refit;

namespace CSPortfolioAPI.Controllers;
[ApiController]
[Route("api/[controller]")]
public class EventController(ILogger<EventController> logger, 
    PriceUpdateEventProducer updateEventProducer,
    InventoryEntryRepository inventoryEntryRepository) : ControllerBase, IEventApi
{
    [HttpPost("priceupdate")]
    public async Task<ActionResult<bool>> SendPriceUpdateAsync([Body] PriceUpdateEvent priceUpdateEvent)
    {
        logger.LogInformation("GetCompleteAsync");
        await updateEventProducer.PublishAsync(priceUpdateEvent);
        return true;
    }

    [HttpGet("priceupdate/all")]
    public async Task<ActionResult<int>> PublishAllAsync()
    {
        logger.LogInformation("PublishAllAsync");
        var entries = await inventoryEntryRepository.GetAllAsync(null, null);
        var events = entries.Select(x => new PriceUpdateEvent() { ItemId = x.ItemId, MarketHashName = x.Item.MarketHashName });
        var priceUpdateEvents = events.ToList();
        await updateEventProducer.PublishBatchAsync(priceUpdateEvents);
        
        return priceUpdateEvents.Count;
    }
}