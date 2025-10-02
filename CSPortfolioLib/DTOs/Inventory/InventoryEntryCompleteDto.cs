namespace CSPortfolioLib.DTOs.Inventory;

public class InventoryEntryCompleteDto
{
    public int ItemId { get; set; }
    public string Name { get; set; }
    public string IconUrl { get; set; }
    public int Quantity { get; set; }
    public decimal TotalValue { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal Trend { get; set; }
}