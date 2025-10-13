using CSPortfolioAPI.Models;
using CSPortfolioAPI.Models.Views;
using FluentResults;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class InventoryEntryRepository(CSDbContext context) : BaseRepository<InventoryEntry>(context)
{
    public override async Task<IEnumerable<InventoryEntry>> GetAllAsync(int? pageNumber, int? pageSize)
    {
        var query = context.InventoryEntries.AsQueryable();
        if (pageNumber.HasValue && pageSize.HasValue)
            query = query
                .Skip(pageNumber.Value * pageSize.Value)
                .Take(pageSize.Value);
        
        return await query
            .Include(c => c.Item)
            .ToListAsync();
    }
    
    public async Task<Result<IEnumerable<InventoryEntryView>>> GetAllCompleteAsync()
    {
        return await Context.Set<InventoryEntryView>().ToListAsync();
    }
    
    public async Task<Result<IEnumerable<InventoryEntryView>>> GetTopCompleteAsync(int count)
    {
        return await Context.InventoryEntryView
            .Where(x => x.Quantity > 0)
            .OrderByDescending(x => x.Trend)
            .Take(count)
            .ToListAsync();
    }
    
    public async Task<Result<IEnumerable<InventoryEntryView>>> GetBottomCompleteAsync(int count)
    {
        return await Context.InventoryEntryView
            .Where(x => x.Quantity > 0)
            .OrderBy(x => x.Trend)
            .Take(count)
            .ToListAsync();
    }
    
    public async Task<Result<decimal>> GetTotalValue()
    {
        return await Context.InventoryEntryView.SumAsync(x => x.TotalValue);
    }
    
    public async Task<Result<int>> GetTotalEntriesCount()
    {
        return await Context.InventoryEntryView.SumAsync(x => x.Quantity);
    }
    
    public async Task<Result<int>> GetUniqueEntriesCount()
    {
        return await Context.InventoryEntryView.CountAsync();
    }
}