using System.Security.Claims;
using CSPortfolioAPI.Models;
using CSPortfolioLib.DTOs.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers.Application;

[Authorize] 
[ApiController]
[Route("api/[controller]")]
public class UserController(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    ILogger<UserController> logger)
    : ControllerBase
{
    [HttpGet("profile")]
    public async Task<IActionResult> GetUser()
    {
        var userId = userManager.GetUserId(User);
        if (userId == null)
        {
            return Unauthorized("User not authenticated.");
        }
        var user = await userManager.FindByIdAsync(userId);
        return Ok(new UserDto(){Username = user.UserName, Email = user.Email});
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
        logger.LogInformation($"Changed password");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Get the user ID from the JWT claim

        if (userId == null)
        {
            return Unauthorized("User not authenticated.");
        }

        var user = await userManager.FindByIdAsync(userId); // Find the user by their ID

        if (user == null)
        {
            return NotFound("User not found.");
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
}