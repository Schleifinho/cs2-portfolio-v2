using CSPortfolioAPI.Models;

namespace CSPortfolioAPI.Repositories;

public class PurchaseRepository(CSDbContext context) : BaseRepository<Purchase>(context)
{
    
}