using CSPortfolioAPI.Errors;
using CSPortfolioAPI.Models;
using CSPortfolioLib.DTOs.Purchase;
using CSPortfolioLib.DTOs.Sale;
using FluentResults;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class TransactionRepository(ILogger<TransactionRepository> logger, CSDbContext context) : BaseRepository<Transaction>(context)
{
    #region Sale
    
    public async Task<Result<List<Transaction>>> GetAllSalesAsync(int? page = null, int? pageSize = null)
    {
        if (!page.HasValue || !pageSize.HasValue)
            return Result.Ok(await Context.Transactions
                .Where(x => x.Type == Transaction.Sale)
                .Include(x => x.InventoryEntry.Item)
                .ToListAsync());
        if (page < 0 || pageSize < 1)
            return Result.Fail("Invalid Page Numbers");
        
        var sales = await Context.Transactions
            .Where(x => x.Type == Transaction.Sale)
            .Include(x => x.InventoryEntry.Item)
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

        await using var t = await Context.Database.BeginTransactionAsync();
        
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
    
        public async Task<Result<Transaction>> UpdateSaleAsync(int id, SaleDto saleDto)
    {
        await using var t = await Context.Database.BeginTransactionAsync();
        try
        {
            var transaction = await Context.Transactions.FirstOrDefaultAsync(x => x.Id == id && x.Type == Transaction.Sale);
            if (transaction == null)
            {
                return Result.Fail<Transaction>(new NotFoundError("Transaction not found."));
            }
            
            var inventoryEntry = await Context.InventoryEntries.FirstOrDefaultAsync(x => x.ItemId == saleDto.ItemId);
            if (inventoryEntry == null)
            {
                return Result.Fail<Transaction>(new NotFoundError("Inventory entry not found."));
            }

            var diff = saleDto.Quantity - transaction.Quantity;
            transaction.Price = saleDto.Price;
            transaction.Quantity = saleDto.Quantity;
            
            inventoryEntry.QuantityOnHand -= diff;
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
    
    public async Task<Result> DeleteSaleAsync(int id)
    {
        await using var t = await Context.Database.BeginTransactionAsync();
        try
        {
            var transaction = await Context.Transactions
                .Include(transaction => transaction.InventoryEntry)
                .FirstOrDefaultAsync(x => x.Id == id && x.Type == Transaction.Sale);
            
            if (transaction == null)
            {
                return Result.Fail(new NotFoundError("Transaction not found."));
            }
            
            var inventoryEntry = transaction.InventoryEntry;
            inventoryEntry.QuantityOnHand += transaction.Quantity;
            Context.Transactions.Remove(transaction);
            await Context.SaveChangesAsync();

            // Commit if everything succeeded
            await t.CommitAsync();
            return Result.Ok();
        }
        catch (Exception ex)
        {
            // Rollback on error
            await t.RollbackAsync();
            return Result.Fail(new Error(ex.Message));
        }
    }
    
    #endregion

    #region Purchases
    
    public async Task<Result<List<Transaction>>> GetAllPurchasesAsync(int? page = null, int? pageSize = null)
    {
        if (!page.HasValue || !pageSize.HasValue)
            return Result.Ok(await Context.Transactions
                .Where(x => x.Type == Transaction.Purchase)
                .Include(x => x.InventoryEntry.Item)
                .ToListAsync());
        if (page < 0 || pageSize < 1)
            return Result.Fail("Invalid Page Numbers");
        
        var sales = await Context.Transactions
            .Where(x => x.Type == Transaction.Purchase)
            .Include(x => x.InventoryEntry.Item)
            .Skip(page.Value * pageSize.Value)
            .Take(pageSize.Value)
            .ToListAsync();
        return Result.Ok(sales);
    }
    

    public async Task<Result<Transaction>> AddPurchaseAsync(PurchaseDto purchaseDto)
    {
        await using var t = await Context.Database.BeginTransactionAsync();
        try
        {
            var inventoryEntry = await Context.InventoryEntries.FirstOrDefaultAsync(x => x.ItemId == purchaseDto.ItemId);
            if (inventoryEntry == null)
            {
                inventoryEntry = new InventoryEntry()
                {
                    ItemId = purchaseDto.ItemId,
                    QuantityOnHand = 0,
                };
                await Context.InventoryEntries.AddAsync(inventoryEntry);
                await Context.SaveChangesAsync();
            }

            var transaction = new Transaction()
            {
                Type = Transaction.Purchase,
                Timestamp = purchaseDto.Timestamp,
                Price = purchaseDto.Price,
                Quantity = purchaseDto.Quantity,
                InventoryEntryId = inventoryEntry.Id
            };
            
            inventoryEntry.QuantityOnHand += purchaseDto.Quantity;
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
    
    public async Task<Result<Transaction>> UpdatePurchaseAsync(int id, PurchaseDto purchaseDto)
    {
        await using var t = await Context.Database.BeginTransactionAsync();
        try
        {
            var transaction = await Context.Transactions.FirstOrDefaultAsync(x => x.Id == id && x.Type == Transaction.Purchase);
            if (transaction == null)
            {
                return Result.Fail<Transaction>(new NotFoundError("Transaction not found."));
            }
            
            var inventoryEntry = await Context.InventoryEntries.FirstOrDefaultAsync(x => x.ItemId == purchaseDto.ItemId);
            if (inventoryEntry == null)
            {
                return Result.Fail<Transaction>(new NotFoundError("Inventory entry not found."));
            }

            var diff = purchaseDto.Quantity - transaction.Quantity;
            transaction.Price = purchaseDto.Price;
            transaction.Quantity = purchaseDto.Quantity;
            
            inventoryEntry.QuantityOnHand += diff;
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
    
    public async Task<Result> DeletePurchaseAsync(int id)
    {
        await using var t = await Context.Database.BeginTransactionAsync();
        try
        {
            var transaction = await Context.Transactions
                .Include(x => x.InventoryEntry)
                .FirstOrDefaultAsync(x => x.Id == id && x.Type == Transaction.Purchase);
            if (transaction == null)
            {
                return Result.Fail(new NotFoundError("Transaction not found."));
            }

            var inventoryEntry = transaction.InventoryEntry;
            inventoryEntry.QuantityOnHand -= transaction.Quantity;
            Context.Transactions.Remove(transaction);
            await Context.SaveChangesAsync();

            // Commit if everything succeeded
            await t.CommitAsync();
            return Result.Ok();
        }
        catch (Exception ex)
        {
            // Rollback on error
            logger.LogInformation(ex.Message);
            logger.LogInformation(ex.StackTrace);
            await t.RollbackAsync();
            return Result.Fail(new Error(ex.Message));
        }
    }
    #endregion
}