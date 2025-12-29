namespace CSPortfolioLib.DTOs.User;

public class UserDto
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string ProfileImageUrl { get; set; }
    public List<string> Roles { get; set; } = new(); 
    public bool ConfirmedEmail { get; set; }
}