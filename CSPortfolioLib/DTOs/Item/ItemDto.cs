using System.ComponentModel.DataAnnotations;
using CSPortfolioLib.Contracts.DTO;

namespace CSPortfolioLib.DTOs.Item;

public class ItemDto : NullableIdDto
{
    [Required]
    public string Name { get; set; }

    [Required] public string MarketHashName { get; set; }
    public string? IconUrl { get; set; }
}