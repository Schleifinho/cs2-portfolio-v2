using CSPortfolioAPI.Models;
using FluentResults;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class PriceHistoryRepository(CSDbContext context) : BaseRepository<PriceHistory>(context)
{
    public async Task<Result<List<PriceHistory>>> GetByItemId(int itemId, DateTimeOffset startDate, DateTimeOffset endDate)
    {
        return await Context.PriceHistories
            .Where(x => 
                x.ItemId == itemId &&
                x.TimeStamp >= startDate &&
                x.TimeStamp <= endDate)
            .ToListAsync();
    }
}