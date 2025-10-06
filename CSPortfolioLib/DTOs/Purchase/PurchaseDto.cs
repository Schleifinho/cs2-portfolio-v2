using CSPortfolioLib.Contracts.DTO;

namespace CSPortfolioLib.DTOs.Purchase;

public class PurchaseDto : NullableIdDto
{
    public int ItemId { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class PurchaseCompleteDto : PurchaseDto
{
    public string Name {get; set;}
    public string IconUrl {get; set;}
}