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
    
    public string GenerateJwtTokenForUser(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName!),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.Now.AddDays(_expireDays),
            signingCredentials: signingCredentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}