using System.ComponentModel.DataAnnotations;

namespace CSPortfolioLib.DTOs.User;

public class ChangeUsernameDto
{
    [Required]
    public required string UserId { get; set; } 
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public required string NewUsername { get; set; }
}