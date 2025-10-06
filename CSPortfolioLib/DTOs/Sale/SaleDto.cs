using System.ComponentModel.DataAnnotations;
using CSPortfolioLib.Contracts.DTO;

namespace CSPortfolioLib.DTOs.Sale;

public class SaleDto : NullableIdDto
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

public class SaleCompleteDto : SaleDto
{
    [Required]
    public string Name { get; set; }
    [Required]
    public string IconUrl { get; set; }
}