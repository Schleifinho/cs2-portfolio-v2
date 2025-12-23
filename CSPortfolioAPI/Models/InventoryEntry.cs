using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CSPortfolioAPI.Contracts;

namespace CSPortfolioAPI.Models;

public class InventoryEntry : DbEntry, IUserFK
{
    public string UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public User User { get; set; }
    
    [Required]
    public int ItemId { get; set; }

    [ForeignKey(nameof(ItemId))]
    public Item Item { get; set; }

    [Required]
    public int QuantityOnHand { get; set; } = 0;

    // Navigation
    public List<Transaction> Transactions { get; set; } = new();
}