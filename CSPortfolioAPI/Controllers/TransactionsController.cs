using AutoMapper;
using CSPortfolioAPI.Errors;
using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Purchase;
using CSPortfolioLib.DTOs.Sale;
using FluentResults;
using Microsoft.AspNetCore.Mvc;
using Refit;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController (ILogger<TransactionsController> logger, 
    TransactionRepository repository,
    IMapper mapper)
    : ControllerBase
{
    #region Sales
    [HttpGet("sales")]
    public async Task<ActionResult<List<SaleCompleteDto>>> GetSalesAsync(int? pageNumber, int? pageSize)
    {
        var transactions = await repository.GetAllSalesAsync(pageNumber, pageSize);
        if (transactions.IsSuccess)
        {
            return mapper.Map<List<SaleCompleteDto>>(transactions.Value);
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
    
    [HttpPut("sale/{id}")]
    public async Task<ActionResult<SaleDto>> UpdateSalesAsync([FromRoute]int id, [FromBody] SaleDto saleDto)
    {
        var response = await repository.UpdateSaleAsync(id, saleDto);
        if (response.IsSuccess)
        {
            var dto = new SaleDto
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
    
    [HttpDelete("sale/{id}")]
    public async Task<ActionResult> DeleteSaleAsync([FromRoute]int id)
    {
        var response = await repository.DeleteSaleAsync(id);
        if (response.IsSuccess)
        {
            return Ok();
        }
        return response.ToActionResult();
    }
    #endregion

    #region Purchase

    [HttpGet("purchases")]
    public async Task<ActionResult<List<PurchaseCompleteDto>>> GetPurchasesAsync(int? pageNumber, int? pageSize)
    {
        var transactions = await repository.GetAllPurchasesAsync(pageNumber, pageSize);
        if (transactions.IsSuccess)
        {
            logger.LogInformation(transactions.Value[0].InventoryEntry.Item.IconUrl);
            return mapper.Map<List<PurchaseCompleteDto>>(transactions.Value);
        }
        return transactions.ToActionResult();
    }
    
    [HttpPost("purchase")]
    public async Task<ActionResult<PurchaseDto>> AddPurchaseAsync([FromBody] PurchaseDto purchaseDto)
    {
        var response = await repository.AddPurchaseAsync(purchaseDto);
        if (response.IsSuccess)
        {
            var dto = new PurchaseDto
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
    
    [HttpPut("purchase/{id}")]
    public async Task<ActionResult<PurchaseDto>> UpdatePurchaseAsync([FromRoute]int id, [FromBody] PurchaseDto purchaseDto)
    {
        var response = await repository.UpdatePurchaseAsync(id, purchaseDto);
        if (response.IsSuccess)
        {
            var dto = new PurchaseDto
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
    
    [HttpDelete("purchase/{id}")]
    public async Task<ActionResult> DeletePurchaseAsync([FromRoute]int id)
    {
        var response = await repository.DeletePurchaseAsync(id);
        if (response.IsSuccess)
        {
            return Ok();
        }
        return response.ToActionResult();
    }

    #endregion
}