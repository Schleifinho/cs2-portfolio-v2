using AutoMapper;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Purchase;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseController (ILogger<PurchaseController> logger, PurchaseRepository repository, IMapper mapper)
    : BaseController<PurchaseDto, Purchase>(logger, repository, mapper)
{
}