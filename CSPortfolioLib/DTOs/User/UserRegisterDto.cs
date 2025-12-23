using System.ComponentModel.DataAnnotations;

namespace CSPortfolioLib.DTOs.User;

public class UserRegisterDto
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Username { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; }
    [Required]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; }

    public override string ToString()
    {
        return $"Username: {Username}, Email: {Email}, Password: ****, ConfirmPassword: ****";
    }
}