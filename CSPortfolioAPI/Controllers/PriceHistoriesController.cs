using AutoMapper;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.PriceHistory;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PriceHistoriesController (ILogger<PriceHistoriesController> logger, PriceHistoryRepository repository, IMapper mapper)
    : BaseController<PriceHistoryDto, PriceHistory>(logger, repository, mapper)
{
}