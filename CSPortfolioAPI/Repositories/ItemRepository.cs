using CSPortfolioAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class ItemRepository(CSDbContext context) : BaseRepository<Item>(context)
{
    public async Task<int> GetTotalCount()
    {
        return await Context.Items.CountAsync();
    }
}