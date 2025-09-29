using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Models;

public class MassTransitDbContext : DbContext
{
    private readonly string _connectionString = "UserName=root;Password=root;Server=masstransit-db;Database=masstransit;";
    public MassTransitDbContext()
    {
    }
    
    public MassTransitDbContext(DbContextOptions options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
    }
    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // TODO: remove??
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql(_connectionString);
        }
    }
}