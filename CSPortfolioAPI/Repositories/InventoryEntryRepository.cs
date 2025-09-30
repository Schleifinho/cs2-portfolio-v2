using CSPortfolioAPI.Models;
using CSPortfolioAPI.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class InventoryEntryRepository(CSDbContext context) : BaseRepository<InventoryEntry>(context)
{
    public override async Task<IEnumerable<InventoryEntry>> GetAllAsync()
    {
        return await DbSet.Include(c => c.Item).ToListAsync();
    }
    
    
    public async Task<IEnumerable<InventoryEntryView>> GetAllCompleteAsync()
    {
        return await Context.Set<InventoryEntryView>().ToListAsync();
    }
}