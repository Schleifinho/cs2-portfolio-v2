using AutoMapper;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Purchase;
using CSPortfolioLib.DTOs.Sale;
using CSPortfolioLib.DTOs.Transaction;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController (ILogger<TransactionsController> logger, TransactionRepository repository, IMapper mapper)
    : BaseController<TransactionDto, Transaction>(logger, repository, mapper)
{
    [HttpGet("sales")]
    public virtual async Task<ActionResult<IEnumerable<SaleDto>>> GetAllSalesAsync()
    {
        logger.LogInformation($"Get all sales");
        return Ok(Mapper.Map<IEnumerable<SaleDto>>(await repository.GetAllSalesAsync()));
    }
    
    [HttpPost("sale")]
    public virtual async Task<ActionResult<SaleDto>> AddSaleAsync(SaleDto saleDto)
    {
        return Ok(Mapper.Map<SaleDto>(await repository.AddSaleAsync(saleDto)));
    }
    
    [HttpGet("purchases")]
    public virtual async Task<ActionResult<IEnumerable<PurchaseRequestDto>>> GetAllPurchasesAsync()
    {
        logger.LogInformation($"Get all sales");
        return Ok(Mapper.Map<IEnumerable<SaleDto>>(await repository.GetAllPurchasesAsync()));
    }
    
    [HttpPost("purchases")]
    public virtual async Task<ActionResult<SaleDto>> AddSaleAsync(PurchaseRequestDto purchaseDto)
    {
        return Ok(Mapper.Map<SaleDto>(await repository.AddPurchaseAsync(purchaseDto)));
    }
}