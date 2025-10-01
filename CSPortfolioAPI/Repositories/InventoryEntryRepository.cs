using CSPortfolioAPI.Models;
using CSPortfolioAPI.Models.Views;
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
    
    public async Task<IEnumerable<InventoryEntryView>> GetAllCompleteAsync()
    {
        return await Context.Set<InventoryEntryView>().ToListAsync();
    }
}