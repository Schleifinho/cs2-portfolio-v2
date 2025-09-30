using System.ComponentModel.DataAnnotations;
using CSPortfolioLib.Contracts.DTO;

namespace CSPortfolioLib.DTOs.Purchase;

public class PurchaseResponseDto : NullableIdDto
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

public class PurchaseRequestDto : NullableIdDto
{
    [Required]
    public int ItemId { get; set; }

    [Required]
    public int Quantity { get; set; }
    
    [Required]
    public double Price { get; set; }

    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}