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
                ? "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIa-2lmxU-LR0dnuNm6E8Vl45Iv181z1fgn8oZTh8Sla4c24abZkIf6HBCnIxLxw5uI9HXHklh4m4TjXw4qsIHPFOFByCMAmTbQJ4Ua4kdfhN7u3-UWA3G22ywJ7/330x192?allow_animated=1" 
                : ProfileImageUrl, 
        };
    }
}