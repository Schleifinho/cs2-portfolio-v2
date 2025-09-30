namespace CSPortfolioAPI.Models.Views;

public class InventoryEntryView
{
    public int ItemId { get; set; }
    public string Name { get; set; }
    public string IconUrl { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
    public decimal CurrentPrice { get; set; }
}