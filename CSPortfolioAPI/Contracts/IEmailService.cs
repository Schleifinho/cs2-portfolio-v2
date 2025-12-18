namespace CSPortfolioAPI.Contracts;

public interface IEmailService
{
    Task SendAsync(string email, string name, string subject, string htmlContent);
}