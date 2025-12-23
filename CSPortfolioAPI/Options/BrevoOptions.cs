namespace CSPortfolioAPI.Options;

public class BrevoOptions
{
    public required string ApiKey { get; set; }
    public required string ApiBaseUrl { get; set; }
    public required string SenderName { get; set; }
    public required string SenderEmail { get; set; }
}