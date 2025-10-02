using CSPortfolioAPI.Errors;
using CSPortfolioAPI.Models;
using CSPortfolioLib.DTOs.Purchase;
using CSPortfolioLib.DTOs.Sale;
using FluentResults;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class TransactionRepository(CSDbContext context) : BaseRepository<Transaction>(context)
{
    public async Task<Result<List<Transaction>>> GetAllSalesAsync(int? page = null, int? pageSize = null)
    {
        if (!page.HasValue || !pageSize.HasValue)
            return Result.Ok(await Context.Transactions.Where(x => x.Type == Transaction.Sale).ToListAsync());
        if (page < 0 || pageSize < 1)
            return Result.Fail("Invalid Page Numbers");
        
        var sales = await Context.Transactions
            .Where(x => x.Type == Transaction.Sale)
            .Skip(page.Value * pageSize.Value)
            .Take(pageSize.Value)
            .ToListAsync();
        return Result.Ok(sales);
    }
    
    public async Task<Result<List<Transaction>>> GetAllPurchasesAsync(int? page = null, int? pageSize = null)
    {
        if (!page.HasValue || !pageSize.HasValue)
            return Result.Ok(await Context.Transactions.Where(x => x.Type == Transaction.Purchase).ToListAsync());
        if (page < 0 || pageSize < 1)
            return Result.Fail("Invalid Page Numbers");
        
        var sales = await Context.Transactions
            .Where(x => x.Type == Transaction.Purchase)
            .Skip(page.Value * pageSize.Value)
            .Take(pageSize.Value)
            .ToListAsync();
        return Result.Ok(sales);
    }
    
    public async Task<Result<Transaction>> AddSaleAsync(SaleDto saleDto)
    {
        var inventoryEntry = await Context.InventoryEntries.FirstOrDefaultAsync(x => x.ItemId == saleDto.ItemId);
        if (inventoryEntry == null)
        {
            return Result.Fail<Transaction>(new NotFoundError("InventoryEntry not found."));
        }

        if (inventoryEntry.QuantityOnHand < saleDto.Quantity)
        {
            return Result.Fail<Transaction>(new BadRequestError("InventoryEntry is out of stock."));
        }

        var transaction = new Transaction()
        {
            Type = Transaction.Sale,
            Timestamp = saleDto.Timestamp,
            Price = saleDto.Price,
            Quantity = saleDto.Quantity,
            InventoryEntryId = inventoryEntry.Id
        };

        await using var t = await context.Database.BeginTransactionAsync();
        
        try
        {
            inventoryEntry.QuantityOnHand -= saleDto.Quantity;
            await Context.Transactions.AddAsync(transaction);
            await Context.SaveChangesAsync();

            // Commit if everything succeeded
            await t.CommitAsync();
            return Result.Ok(transaction);
        }
        catch(Exception ex)
        {
            // Rollback on error
            await t.RollbackAsync();
            return Result.Fail<Transaction>(new Error(ex.Message));
        }
    }
    
    public async Task<Result<Transaction>> AddPurchaseAsync(PurchaseRequestDto purchaseRequestDto)
    {
        await using var t = await context.Database.BeginTransactionAsync();
        try
        {
            var inventoryEntry = await Context.InventoryEntries.FirstOrDefaultAsync(x => x.ItemId == purchaseRequestDto.ItemId);
            if (inventoryEntry == null)
            {
                inventoryEntry = new InventoryEntry()
                {
                    ItemId = purchaseRequestDto.ItemId,
                    QuantityOnHand = 0,
                };
                await Context.InventoryEntries.AddAsync(inventoryEntry);
                await Context.SaveChangesAsync();
            }

            var transaction = new Transaction()
            {
                Type = Transaction.Purchase,
                Timestamp = purchaseRequestDto.Timestamp,
                Price = purchaseRequestDto.Price,
                Quantity = purchaseRequestDto.Quantity,
                InventoryEntryId = inventoryEntry.Id
            };
            
            inventoryEntry.QuantityOnHand += purchaseRequestDto.Quantity;
            await Context.Transactions.AddAsync(transaction);
            await Context.SaveChangesAsync();

            // Commit if everything succeeded
            await t.CommitAsync();
            return Result.Ok(transaction);
        }
        catch (Exception ex)
        {
            // Rollback on error
            await t.RollbackAsync();
            return Result.Fail<Transaction>(new Error(ex.Message));
        }
    }
}