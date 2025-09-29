using AutoMapper;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryEntryController (ILogger<InventoryEntryController> logger, InventoryEntryRepository repository, IMapper mapper)
    : BaseController<InventoryEntryDto, InventoryEntry>(logger, repository, mapper)
{
}