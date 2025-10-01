namespace CSPortfolioLib.Events;

public class PriceUpdateEvent
{
    public int ItemId { get; set; }
    public string MarketHashName { get; set; }
}