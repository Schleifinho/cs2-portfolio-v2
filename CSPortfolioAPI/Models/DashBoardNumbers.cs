namespace CSPortfolioAPI.Models;

public class DashBoardNumbers
{
    public long TotalItems { get; set; }
    public long TotalUniqueItems { get; set; }
    public decimal RawValue { get; set; }
    public decimal TotalTrend { get; set; }
    public long RecentTransactions { get; set; }
}