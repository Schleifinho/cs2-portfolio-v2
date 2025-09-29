using AutoMapper;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Item;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]

public class ItemController (ILogger<ItemController> logger, ItemRepository repository, IMapper mapper)
    : BaseController<ItemDto, Item>(logger, repository, mapper)
{
}