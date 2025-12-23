using System.Security.Claims;
using CSPortfolioAPI.Models;
using CSPortfolioLib.DTOs.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace CSPortfolioAPI.Controllers.Application;

[Authorize] 
[ApiController]
[Route("api/[controller]")]
public class UserController(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    IWebHostEnvironment webHostEnvironment,
    ILogger<UserController> logger)
    : ControllerBase
{
    private const long MaxFileSize = 2 * 1024 * 1024; // 2 MB
    private const int ImageSize = 256;
    
    [HttpGet("profile")]
    public async Task<IActionResult> GetUser()
    {
        var userId = userManager.GetUserId(User);
        if (userId == null)
        {
            return Unauthorized("User not authenticated.");
        }
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized("User not authenticated.");
        }
        return Ok(user.ToDto());
    }

    [HttpPut("change-username")]
    public async Task<IActionResult> ChangeUsername([FromBody] ChangeUsernameDto dto)
    {
        logger.LogInformation("Changed username");
        // Get the user ID from the JWT token (user making the request)
        var userIdFromToken = userManager.GetUserId(User);
        
        if (userIdFromToken == null)
        {
            return Unauthorized("User not authenticated.");
        }
        // Check if the current user is the one making the request
        if (userIdFromToken != dto.UserId)
        {
            return Forbid("You are not allowed to change the username of another user");
        }

        // Find the user from the database
        //var user = await _userManager.FindByIdAsync(model.UserId);
        var user = await userManager.FindByIdAsync(dto.UserId);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Update the username
        user.UserName = dto.NewUsername;

        var result = await userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            return Ok("Username changed successfully.");
        }

        return BadRequest("Error changing username.");
    }
    
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto model)
    {
        var userId = userManager.GetUserId(User);
        if (userId == null)
        {
            return Unauthorized("User not authenticated.");
        }
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized("User not authenticated.");
        }
        // Verify current password
        var passwordValid = await userManager.CheckPasswordAsync(user, model.CurrentPassword);
        if (!passwordValid)
        {
            return BadRequest("Current password is incorrect.");
        }

        // Change password
        var result = await userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

        if (result.Succeeded)
        {
            // Optionally sign the user out or update authentication cookie/session here
            await signInManager.RefreshSignInAsync(user);

            return Ok(new { message = "Password changed successfully." });
        }

        return BadRequest("Failed to change password.");
    }
    
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (file.Length > MaxFileSize)
            return BadRequest("File size exceeds 2MB.");

        if (!file.ContentType.StartsWith("image/"))
            return BadRequest("Invalid file type.");

        var user = await userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var webRoot = string.IsNullOrEmpty(webHostEnvironment.WebRootPath) == false 
                ? webHostEnvironment.WebRootPath 
                : Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        var profilePath = Path.Combine(webRoot, "uploads", "profile");
        Directory.CreateDirectory(profilePath);
        var filePath = Path.Combine(profilePath, $"{user.Id}.jpg");

        // Resize + crop to 256x256
        using var image = await Image.LoadAsync(file.OpenReadStream());
        image.Mutate(x =>
            x.Resize(new ResizeOptions
            {
                Size = new Size(ImageSize, ImageSize),
                Mode = ResizeMode.Crop
            })
        );

        await image.SaveAsync(
            filePath,
            new JpegEncoder { Quality = 90 }
        );

        // Update user (UPSERT)
        user.ProfileImageUrl = $"/uploads/profile/{user.Id}.jpg";
        await userManager.UpdateAsync(user);

        return Ok(user.ToDto());
    }
}