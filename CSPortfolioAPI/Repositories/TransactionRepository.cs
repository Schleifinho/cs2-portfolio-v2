using CSPortfolioAPI.Models;
using CSPortfolioLib.DTOs.Purchase;
using CSPortfolioLib.DTOs.Sale;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class TransactionRepository(CSDbContext context) : BaseRepository<Transaction>(context)
{
    public async Task<IEnumerable<Transaction>> GetAllSalesAsync()
    {
        return await Context.Transactions.Where(x => x.Type == Transaction.Sale).ToListAsync();
    }
    
    public async Task<IEnumerable<Transaction>> GetAllPurchasesAsync()
    {
        return await Context.Transactions.Where(x => x.Type == Transaction.Purchase).ToListAsync();
    }
    
    public async Task<Transaction> AddSaleAsync(SaleDto saleDto)
    {
        var inventoryEntry = await Context.InventoryEntries.FindAsync(saleDto.Id);
        if (inventoryEntry == null)
        {
            throw new NullReferenceException("inventoryEntry not found");
        }

        if (inventoryEntry.QuantityOnHand < saleDto.Quantity)
        {
            throw new ArgumentException("QuantityOnHand must be less than or equal to sale.");
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
        }
        catch
        {
            // Rollback on error
            await t.RollbackAsync();
            throw;
        }
        return transaction;
    }
    
    public async Task<Transaction> AddPurchaseAsync(PurchaseRequestDto purchaseRequestDto)
    {
        throw new NotImplementedException();
        /*
        var inventoryEntry = await Context.InventoryEntries.FindAsync(purchaseRequestDto.Id);
        if (inventoryEntry == null)
        {
            throw new NullReferenceException("inventoryEntry not found");
        }

        if (inventoryEntry.QuantityOnHand < saleDto.Quantity)
        {
            throw new ArgumentException("QuantityOnHand must be less than or equal to sale.");
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
        }
        catch
        {
            // Rollback on error
            await t.RollbackAsync();
            throw;
        }
        return transaction;
        */
    }
}