using CSPortfolioAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public abstract class BaseRepository<TEntity>(CSDbContext context)
    where TEntity : class
{
    protected readonly CSDbContext Context = context;
    protected readonly DbSet<TEntity> DbSet = context.Set<TEntity>();

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync(int? pageNumber, int? pageSize)
    {
        IQueryable<TEntity> query = DbSet;
        if(pageNumber.HasValue && pageSize.HasValue)
            query = query
                .Skip(pageSize.Value * pageNumber.Value)
                .Take(pageSize.Value);
        
        return await query.ToListAsync();
    }
    
    public virtual async Task<TEntity?> GetByIdAsync(int id)
    {
        return await DbSet.FindAsync(id);
    }

    public virtual async Task AddAsync(TEntity entity)
    {
        await DbSet.AddAsync(entity);
        await Context.SaveChangesAsync();
    }
    
    public virtual async Task BulkAddAsync(IEnumerable<TEntity> entity)
    {
        await DbSet.AddRangeAsync(entity);
        await Context.SaveChangesAsync();
        Console.WriteLine("Saving");
    }

    public virtual async Task UpdateAsync(TEntity entity)
    {
        DbSet.Update(entity);
        await Context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            DbSet.Remove(entity);
            await Context.SaveChangesAsync();
        }
    }
}