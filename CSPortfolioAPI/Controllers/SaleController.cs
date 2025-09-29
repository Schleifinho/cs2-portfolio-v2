using AutoMapper;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Item;
using CSPortfolioLib.DTOs.Sale;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SaleController (ILogger<SaleController> logger, SaleRepository repository, IMapper mapper)
    : BaseController<SaleDto, Sale>(logger, repository, mapper)
{
}