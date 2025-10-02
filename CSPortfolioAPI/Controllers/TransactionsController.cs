using AutoMapper;
using CSPortfolioAPI.Errors;
using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Purchase;
using CSPortfolioLib.DTOs.Sale;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController (ILogger<TransactionsController> logger, 
    TransactionRepository repository,
    IMapper mapper)
    : ControllerBase
{
    [HttpGet("sales")]
    public async Task<ActionResult<List<SaleDto>>> GetSalesAsync(int? pageNumber, int? pageSize)
    {
        var transactions = await repository.GetAllSalesAsync(pageNumber, pageSize);
        if (transactions.IsSuccess)
        {
            return mapper.Map<List<SaleDto>>(transactions.Value);
        }
        return transactions.ToActionResult();
    }

    [HttpPost("sale")]
    public async Task<ActionResult<SaleDto>> AddSaleAsync([FromBody] SaleDto saleDto)
    {
        var response = await repository.AddSaleAsync(saleDto);
        if (response.IsSuccess)
        {
            var dto = new SaleDto()
            {
                Id = response.Value.Id,
                Quantity = response.Value.Quantity,
                Price = response.Value.Price,
                Timestamp = response.Value.Timestamp
            };
            return Ok(dto);
        }

        return response.ToActionResult();
    }
    
    [HttpGet("purchases")]
    public async Task<ActionResult<List<PurchaseResponseDto>>> GetPurchasesAsync(int? pageNumber, int? pageSize)
    {
        var transactions = await repository.GetAllPurchasesAsync(pageNumber, pageSize);
        if (transactions.IsSuccess)
        {
            return mapper.Map<List<PurchaseResponseDto>>(transactions.Value);
        }
        return transactions.ToActionResult();
    }
    
    [HttpPost("purchase")]
    public async Task<ActionResult<PurchaseResponseDto>> AddPurchaseAsync([FromBody] PurchaseRequestDto purchaseDto)
    {
        var response = await repository.AddPurchaseAsync(purchaseDto);
        if (response.IsSuccess)
        {
            var dto = new PurchaseResponseDto
            {
                Id = response.Value.Id,
                InventoryEntryId = response.Value.InventoryEntryId,
                Quantity = response.Value.Quantity,
                Price = response.Value.Price,
                Timestamp = response.Value.Timestamp
            };
            return Ok(dto);
        }
        
        return StatusCode (500);
    }
}