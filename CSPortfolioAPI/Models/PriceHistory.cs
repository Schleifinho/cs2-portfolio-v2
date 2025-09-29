using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CSPortfolioAPI.Models;

public class PriceHistory
{
    public DateTime TimeStamp { get; set; }
    [Required]
    public int ItemId { get; set; }

    [ForeignKey(nameof(ItemId))]
    public Item Item { get; set; }
    
    [Required]
    public decimal Price { get; set; }
}