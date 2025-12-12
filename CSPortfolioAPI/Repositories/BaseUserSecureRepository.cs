using CSPortfolioAPI.Contracts;
using CSPortfolioAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public abstract class BaseUserSecureRepository<TEntity>(CSDbContext context)
    where TEntity : class, IUserFK
{
    protected readonly CSDbContext Context = context;
    protected readonly DbSet<TEntity> DbSet = context.Set<TEntity>();
    
    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(string userId, int? pageNumber, int? pageSize)
    {
        IQueryable<TEntity> query = DbSet;
        if (pageNumber.HasValue && pageSize.HasValue)
        {
            query = query
                .Where(x => x.UserId == userId)
                .Skip(pageSize.Value * pageNumber.Value)
                .Take(pageSize.Value);
        }
        return await query.ToListAsync();
    }
    
    public virtual async Task<TEntity?> GetByIdAsync(string userId, int id)
    {
        return await DbSet.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == id);
    }

    public virtual async Task AddAsync(string userId, TEntity entity)
    {
        if (entity.UserId != userId)
        {
            return;
        }
        
        await DbSet.AddAsync(entity);
        await Context.SaveChangesAsync();
    }
    
    public virtual async Task BulkAddAsync(string userId, List<TEntity> entity)
    {
        if (entity.Any(x => x.UserId != userId))
        {
            return;
        }
        
        await DbSet.AddRangeAsync(entity);
        await Context.SaveChangesAsync();
        Console.WriteLine("Saving");
    }

    public virtual async Task UpdateAsync(string userId, TEntity entity)
    {
        if (entity.UserId != userId)
        {
            return;
        }
        
        DbSet.Update(entity);
        await Context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(string userId, int id)
    {
        var entity = await GetByIdAsync(userId, id);
        if (entity != null)
        {
            DbSet.Remove(entity);
            await Context.SaveChangesAsync();
        }
    }
}