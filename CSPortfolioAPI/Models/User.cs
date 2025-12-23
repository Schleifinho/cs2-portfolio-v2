using CSPortfolioLib.DTOs.User;
using Microsoft.AspNetCore.Identity;

namespace CSPortfolioAPI.Models;

public class User: IdentityUser
{
    public string? ProfileImageUrl { get; set; }
    
    public UserDto ToDto ()
    {
        
        return new UserDto()
        {
            Username = UserName, 
            Email = Email, 
            ConfirmedEmail = EmailConfirmed,
            ProfileImageUrl = string.IsNullOrWhiteSpace(ProfileImageUrl) 
                ? "/uploads/profile/default.jpg" 
                : ProfileImageUrl, 
        };
    }
}