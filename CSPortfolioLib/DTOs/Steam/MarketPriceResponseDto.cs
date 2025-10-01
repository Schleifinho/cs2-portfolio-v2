using System.Text.Json.Serialization;

namespace CSPortfolioLib.DTOs.Steam;

public class MarketPriceResponseDto
{
    public bool Success { get; set; }
    [JsonPropertyName("lowest_price")]
    public string LowestPrice { get; set; }
    public string Volume { get; set; }
    
    [JsonPropertyName("median_price")]
    public string MedianPrice { get; set; }
}