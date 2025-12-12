using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CSPortfolioAPI.Contracts;

namespace CSPortfolioAPI.Models;

public class Transaction : DbEntry, IUserFK
{
    public string UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; }
    
    [Required]
    public int InventoryEntryId { get; set; }

    [ForeignKey(nameof(InventoryEntryId))]
    public InventoryEntry InventoryEntry { get; set; }

    [Required]
    public int Quantity { get; set; }
    
    [Required]
    public double Price { get; set; }

    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [Required]
    public string Type { get; set; }
    
    public static string Purchase = "P";
    public static string Sale = "S";
}