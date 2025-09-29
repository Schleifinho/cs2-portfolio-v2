using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Models;

public class CSDbContext(DbContextOptions<CSDbContext> options) : DbContext(options)
{
    public DbSet<Item> Items { get; set; }
    public DbSet<InventoryEntry> InventoryEntries { get; set; }
    public DbSet<PriceHistory> PriceHistories { get; set; }
    public DbSet<Purchase> Purchases { get; set; }
    public DbSet<Sale> Sales { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Item>()
            .HasIndex(i => i.MarketHashName)
            .IsUnique();
        
        modelBuilder.Entity<PriceHistory>(entity => { entity.HasNoKey(); });

        base.OnModelCreating(modelBuilder);
    }
}