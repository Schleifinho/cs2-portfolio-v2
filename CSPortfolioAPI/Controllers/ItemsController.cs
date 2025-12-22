using AutoMapper;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Item;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]

public class ItemsController(ILogger<ItemsController> logger, ItemRepository repository, IMapper mapper)
    : BaseController<ItemDto, Item>(logger, repository, mapper)
{
    [HttpGet("total/count")]
    public async Task<ActionResult<int>> GetItemsCount()
    {
        return await repository.GetTotalCount();
    }

    [HttpGet("noicon")]
    public async Task<ActionResult<List<ItemDto>>> GetItemWithoutIconAsync()
    {
        var items = await repository.GetIconLess();
        return Ok(mapper.Map<List<ItemDto>>(items));
    }
}