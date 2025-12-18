using CSPortfolioAPI.Contracts;
using CSPortfolioAPI.Models;

namespace CSPortfolioAPI.Services;

public sealed class EmailVerificationService(
    IEmailService emailService,
    IConfiguration config)
{
    public async Task SendVerificationEmailAsync(User user, string token)
    {
        var link =
            $"{config["Brevo:FrontendUrl"]}/verify-email?token={token}";

        var html = $"""
                        <div style="font-family:Arial, sans-serif">
                            <h2>Verify your email</h2>
                            <p>Please confirm your email address by clicking the button below.</p>
                    
                            <a href="{link}"
                               style="
                                 display:inline-block;
                                 padding:10px 16px;
                                 background:#4f46e5;
                                 color:white;
                                 text-decoration:none;
                                 border-radius:6px">
                               Verify Email
                            </a>
                    
                            <p style="margin-top:16px;font-size:12px;color:#666">
                                This link expires in 24 hours.
                            </p>
                        </div>
                    """;

        await emailService.SendAsync(
            user.Email,
            user.UserName,
            "Verify your email",
            html
        );
    }
}