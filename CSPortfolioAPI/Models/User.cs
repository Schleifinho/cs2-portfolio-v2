using CSPortfolioAPI.Utils;
using CSPortfolioLib.DTOs.User;
using Microsoft.AspNetCore.Identity;

namespace CSPortfolioAPI.Models;

public class User: IdentityUser
{
    public string? ProfileImageUrl { get; set; }
    public DateTime? LastVerificationEmailSentAt { get; set; }
    
    public async Task<UserDto> ToDtoAsync(UserManager<User> userManager)
    {
        var roles = await userManager.GetRolesAsync(this);

        return new UserDto
        {
            Username = UserName,
            Email = Email,
            ConfirmedEmail = EmailConfirmed,
            ProfileImageUrl = string.IsNullOrWhiteSpace(ProfileImageUrl)
                ? "/uploads/profile/default.jpg"
                : ProfileImageUrl,
            Roles = roles.Count == 0 ? [AppRoles.NoEmailVerification] : roles.ToList()
        };
    }
}