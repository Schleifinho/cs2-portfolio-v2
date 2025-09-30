using CSPortfolioLib.Contracts.DTO;

namespace CSPortfolioLib.DTOs.Inventory;

public class InventoryEntryCompleteDto : NullableIdDto
{
    public int ItemId { get; set; }
    public string Name { get; set; }
    public string IconUrl { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
    public decimal CurrentPrice { get; set; }
}