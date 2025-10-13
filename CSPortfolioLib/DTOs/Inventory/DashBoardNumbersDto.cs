namespace CSPortfolioLib.DTOs.Inventory;

public class DashBoardNumbersDto
{
    public long TotalItems { get; set; }
    public long TotalUniqueItems { get; set; }
    public decimal TotalValue { get; set; }
    public long RecentTransactions { get; set; }
}