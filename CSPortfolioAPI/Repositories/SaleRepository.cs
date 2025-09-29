using CSPortfolioAPI.Models;

namespace CSPortfolioAPI.Repositories;

public class SaleRepository(CSDbContext context) : BaseRepository<Sale>(context)
{
    
}