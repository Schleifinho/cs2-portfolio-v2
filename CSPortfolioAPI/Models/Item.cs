using System.ComponentModel.DataAnnotations;

namespace CSPortfolioAPI.Models;

public class Item : DbEntry
{
    [Required]
    public string Name { get; set; }
    [Required]
    public string MarketHashName { get; set; }
    
    public string? IconUrl { get; set; }
    
    // Navigation
    public List<InventoryEntry> InventoryEntries { get; set; } = new();
}