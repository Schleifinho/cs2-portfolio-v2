using CSPortfolioAPI.Models;

namespace CSPortfolioAPI.Repositories;

public class PriceHistoryRepository(CSDbContext context) : BaseRepository<PriceHistory>(context)
{
}