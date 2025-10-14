namespace CSPortfolioLib.Options;

public class ApiSettings
{
    public string Url { get; set; } = string.Empty;
    public string SteamUrl { get; set; } = string.Empty;
    public int Timeout { get; set; } = 60;
}