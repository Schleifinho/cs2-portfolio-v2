using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CSPortfolioAPI.Models;

public abstract class Transaction : DbEntry
{
    [Required]
    public int InventoryEntryId { get; set; }

    [ForeignKey(nameof(InventoryEntryId))]
    public InventoryEntry InventoryEntry { get; set; }

    [Required]
    public int Quantity { get; set; }
    
    [Required]
    public double PriceHistory { get; set; }

    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}