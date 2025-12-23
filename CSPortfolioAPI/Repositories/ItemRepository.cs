using CSPortfolioAPI.Models;
using CSPortfolioLib.DTOs.Item;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class ItemRepository(CSDbContext context) : BaseRepository<Item>(context)
{
    public async Task<int> GetTotalCount()
    {
        return await Context.Items.CountAsync();
    }
    
    public async Task<List<Item>> GetIconLess()
    {
        return await Context.Items.Where(x => x.IconUrl == null).ToListAsync();
    }
}