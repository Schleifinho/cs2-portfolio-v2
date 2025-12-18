using brevo_csharp.Api;
using brevo_csharp.Model;
using CSPortfolioAPI.Contracts;
using CSPortfolioAPI.Options;
using Microsoft.Extensions.Options;
using Task = System.Threading.Tasks.Task;

namespace CSPortfolioAPI.Services;

public sealed class BrevoEmailService(
    ILogger<BrevoEmailService> logger,
    ITransactionalEmailsApi transactionalEmails,
    IOptions<BrevoOptions> brevoOptions)
    : IEmailService
{
    private readonly string _myEmail = brevoOptions.Value.SenderEmail;
    private readonly string _myName = brevoOptions.Value.SenderName;

    public async Task SendAsync(string email, string name, string subject, string htmlContent)
    {
        transactionalEmails.Configuration.AddApiKey("api-key", brevoOptions.Value.ApiKey);
        
        var request = new SendSmtpEmail()
        {
            Subject = subject,
            HtmlContent = htmlContent,
            Sender = new SendSmtpEmailSender(
                email: _myEmail,
                name: _myName
            ),
            To = new List<SendSmtpEmailTo>
            {
                new(email: email, name: name)
            }
        };
        
        await transactionalEmails.SendTransacEmailAsync(request);
    }
}