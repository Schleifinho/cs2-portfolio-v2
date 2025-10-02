namespace CSPortfolioLib.DTOs.Purchase;

public class PurchaseResponseDto
{
    public int? Id { get; set; }
    public int InventoryEntryId { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class PurchaseRequestDto
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}