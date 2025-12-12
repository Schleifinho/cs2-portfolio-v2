using AutoMapper;
using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.DTOs.Purchase;
using CSPortfolioLib.DTOs.Sale;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController (ILogger<TransactionsController> logger, 
    TransactionRepository repository,
    UserManager<User> userManager,
    IMapper mapper)
    : ControllerBase
{
    #region Sales
    [HttpGet("sales")]
    public async Task<ActionResult<List<SaleCompleteDto>>> GetSalesAsync(int? pageNumber, int? pageSize)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        logger.LogInformation($"Get Sales");
        var transactions = await repository.GetAllSalesAsync(userId, pageNumber, pageSize);
        if (transactions.IsSuccess)
        {
            return mapper.Map<List<SaleCompleteDto>>(transactions.Value);
        }
        return transactions.ToActionResult();
    }

    [HttpPost("sale")]
    public async Task<ActionResult<SaleDto>> AddSaleAsync([FromBody] SaleDto saleDto)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }

        logger.LogInformation($"Add Sales");
        var response = await repository.AddSaleAsync(userId, saleDto);
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
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        var response = await repository.UpdateSaleAsync(id, userId, saleDto);
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
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        var response = await repository.DeleteSaleAsync(userId, id);
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
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        logger.LogInformation($"Get Purchases");
        var transactions = await repository.GetAllPurchasesAsync(userId, pageNumber, pageSize);
        if (transactions.IsSuccess)
        {
            return mapper.Map<List<PurchaseCompleteDto>>(transactions.Value);
        }
        return transactions.ToActionResult();
    }
    
    [HttpPost("purchase")]
    public async Task<ActionResult<PurchaseDto>> AddPurchaseAsync([FromBody] PurchaseDto purchaseDto)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        logger.LogInformation($"Add Purchases");
        var response = await repository.AddPurchaseAsync(userId, purchaseDto);
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
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        var response = await repository.UpdatePurchaseAsync(id, userId, purchaseDto);
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
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        var response = await repository.DeletePurchaseAsync(userId, id);
        if (response.IsSuccess)
        {
            return Ok();
        }
        return response.ToActionResult();
    }

    #endregion
}