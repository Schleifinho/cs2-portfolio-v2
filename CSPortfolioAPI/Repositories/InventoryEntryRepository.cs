using CSPortfolioAPI.Models;

namespace CSPortfolioAPI.Repositories;

public class InventoryEntryRepository(CSDbContext context) : BaseRepository<InventoryEntry>(context)
{
    
}