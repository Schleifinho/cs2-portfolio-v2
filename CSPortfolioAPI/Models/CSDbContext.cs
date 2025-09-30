using CSPortfolioAPI.Models.Views;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Models;

public class CSDbContext(DbContextOptions<CSDbContext> options) : DbContext(options)
{
    public DbSet<Item> Items { get; set; }
    public DbSet<InventoryEntry> InventoryEntries { get; set; }
    public DbSet<PriceHistory> PriceHistories { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<InventoryEntryView> InventoryEntryView { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Item>()
            .HasIndex(i => i.MarketHashName)
            .IsUnique();
        
        modelBuilder.Entity<InventoryEntryView>()
            .HasNoKey() // Views typically don't have keys
            .ToView("inventory_entry_view"); // Specify the view name

        modelBuilder.Entity<PriceHistory>(entity => { entity.HasKey(p => new {
            p.ItemId, p.TimeStamp
        }); });

        base.OnModelCreating(modelBuilder);
    }
}