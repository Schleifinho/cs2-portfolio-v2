using CSPortfolioAPI.Models;

namespace CSPortfolioAPI.Repositories;

public class ItemRepository(CSDbContext context) : BaseRepository<Item>(context)
{
    
}