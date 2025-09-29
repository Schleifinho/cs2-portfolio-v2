using System.ComponentModel.DataAnnotations;
using CSPortfolioLib.Contracts.DTO;

namespace CSPortfolioLib.DTOs.PriceHistory;

public class PriceHistoryDto : NullableIdDto
{
    public DateTime TimeStamp { get; set; }
    
    [Required]
    public int ItemId { get; set; }
    
    [Required]
    public decimal Price { get; set; }
}