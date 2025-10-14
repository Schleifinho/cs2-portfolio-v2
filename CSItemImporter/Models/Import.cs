using System.Text.Json.Serialization;

namespace CSItemImporter.Models;

public class Root
{
    [JsonPropertyName("results")]
    public List<Result> Results { get; set; }
}

public class Result
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("hash_name")]
    public string HashName { get; set; }

    [JsonPropertyName("asset_description")]
    public AssetDescription AssetDescription { get; set; }
}

public class AssetDescription
{
    [JsonPropertyName("market_hash_name")]
    public string MarketHashName { get; set; }

    [JsonPropertyName("icon_url")]
    public string IconUrl { get; set; }
}