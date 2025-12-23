using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CSPortfolioAPI.Utils;

public class JwtTokenHandler(IOptions<JwtOptions> options)
{
    private readonly string _key = options.Value.SecretKey;
    private readonly string _issuer = options.Value.Issuer;
    private readonly string _audience = options.Value.Audience;
    private readonly int _expireDays = options.Value.ExpireDays;

    private SymmetricSecurityKey SigningKey =>
        new(Encoding.UTF8.GetBytes(_key));
    
    /* ===========================
     * AUTH TOKEN (LOGIN)
     * =========================== */
    public string GenerateJwtTokenForUser(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName!),
        };

        return GenerateToken(
            claims,
            DateTime.UtcNow.AddDays(_expireDays)
        );
    }
    
    /* ===========================
     * EMAIL VERIFICATION TOKEN
     * =========================== */
    public string GenerateEmailVerificationToken(string userId)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim("purpose", "email_verification"),
            new Claim(ClaimTypes.NameIdentifier, userId),
        };

        return GenerateToken(
            claims,
            DateTime.UtcNow.AddHours(24)
        );
    }
    
    public string? ValidateEmailVerificationToken(string token)
    {
        var principal = ValidateToken(token);
        if (principal is null)
            return null;

        var purpose = principal.FindFirst("purpose")?.Value;
        if (purpose != "email_verification")
            return null;

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userId;
    }
    
    /* ===========================
     * INTERNAL HELPERS
     * =========================== */
    private string GenerateToken(IEnumerable<Claim> claims, DateTime expires)
    {
        var credentials = new SigningCredentials(
            SigningKey,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(
                token,
                new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _issuer,

                    ValidateAudience = true,
                    ValidAudience = _audience,

                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = SigningKey,

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                },
                out _
            );

            return principal;
        }
        catch
        {
            return null;
        }
    }
}