using CSPortfolioLib.Events;
using CSPortfolioLib.Producers;
using Microsoft.AspNetCore.Mvc;
using Refit;

namespace CSPortfolioAPI.Controllers;
[ApiController]
[Route("api/[controller]")]
public class EventController(ILogger<EventController> logger, PriceUpdateEventProducer updateEventProducer) : ControllerBase
{
    [HttpPost("priceupdate")]
    public async Task<ActionResult<bool>> GetComplete([Body] PriceUpdateEvent priceUpdateEvent)
    {
        await updateEventProducer.PublishAsync(priceUpdateEvent);
        return true;
    }
}