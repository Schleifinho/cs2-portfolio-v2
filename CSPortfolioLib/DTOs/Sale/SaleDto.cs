using System.ComponentModel.DataAnnotations;
using CSPortfolioLib.Contracts.DTO;

namespace CSPortfolioLib.DTOs.Sale;

public class SaleDto : NullableIdDto
{
    [Required]
    public int InventoryEntryId { get; set; }

    [Required]
    public int Quantity { get; set; }
    
    [Required]
    public double Price { get; set; }

    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}