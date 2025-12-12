using System.ComponentModel.DataAnnotations;

namespace CSPortfolioLib.DTOs.User;

public class ChangePasswordRequestDto
{
    [Required]
    [DataType(DataType.Password)]
    public required string CurrentPassword { get; set; }
    [Required]
    [DataType(DataType.Password)]
    public required string NewPassword { get; set; }
    [Required]
    [Compare("NewPassword", ErrorMessage = "The password and confirmation password do not match.")]
    public required string ConfirmPassword { get; set; }
}