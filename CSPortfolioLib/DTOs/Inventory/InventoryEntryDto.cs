using System.ComponentModel.DataAnnotations;
using CSPortfolioLib.Contracts.DTO;
using CSPortfolioLib.DTOs.Item;

namespace CSPortfolioLib.DTOs.Inventory;

public class InventoryEntryDto : NullableIdDto
{
    [Required]
    public int ItemId { get; set; }

    [Required]
    public int QuantityOnHand { get; set; } = 0;
}