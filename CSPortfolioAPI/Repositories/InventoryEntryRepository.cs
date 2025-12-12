using CSPortfolioAPI.Models;
using CSPortfolioAPI.Models.Views;
using FluentResults;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class InventoryEntryRepository(CSDbContext context) : BaseUserSecureRepository<InventoryEntry>(context)
{
    public async Task<IEnumerable<InventoryEntry>> GetAllAsync(int? pageNumber, int? pageSize)
    {
        var query = Context.InventoryEntries.AsQueryable();
        if (pageNumber.HasValue && pageSize.HasValue)
            query = query
                .Skip(pageNumber.Value * pageSize.Value)
                .Take(pageSize.Value);
        
        return await query
            .Include(c => c.Item)
            .ToListAsync();
    }
    
    public override async Task<IEnumerable<InventoryEntry>> GetAllAsync(string userid, int? pageNumber, int? pageSize)
    {
        var query = Context.InventoryEntries.AsQueryable();
        if (pageNumber.HasValue && pageSize.HasValue)
            query = query
                .Where(e => e.UserId == userid)
                .Skip(pageNumber.Value * pageSize.Value)
                .Take(pageSize.Value);
        
        return await query
            .Include(c => c.Item)
            .ToListAsync();
    }
    
    public async Task<Result<IEnumerable<InventoryEntryView>>> GetAllCompleteAsync(string userid)
    {
        return await Context.Set<InventoryEntryView>().Where(x => x.UserId == userid).ToListAsync();
    }
    
    public async Task<Result<IEnumerable<InventoryEntryView>>> GetTopCompleteAsync(string userId, int count)
    {
        return await Context.InventoryEntryView
            .Where(x => x.UserId == userId && x.Quantity > 0)
            .OrderByDescending(x => x.Trend)
            .Take(count)
            .ToListAsync();
    }
    
    public async Task<Result<IEnumerable<InventoryEntryView>>> GetBottomCompleteAsync(string userId, int count)
    {
        return await Context.InventoryEntryView
            .Where(x => x.UserId == userId && x.Quantity > 0)
            .OrderBy(x => x.Trend)
            .Take(count)
            .ToListAsync();
    }
    
    public async Task<Result<decimal>> GetTotalValue(string userId)
    {
        return await Context.InventoryEntryView
            .Where(x => x.UserId == userId)
            .SumAsync(x => x.TotalValue);
    }
    
    public async Task<Result<int>> GetTotalEntriesCount(string userId)
    {
        return await Context.InventoryEntryView
            .Where(x => x.UserId == userId)
            .SumAsync(x => x.Quantity);
    }
    
    public async Task<Result<int>> GetUniqueEntriesCount(string userId)
    {
        return await Context.InventoryEntryView
            .Where(x => x.UserId == userId)
            .CountAsync();
    }
}