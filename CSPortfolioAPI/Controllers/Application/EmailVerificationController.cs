using CSPortfolioAPI.Models;
using CSPortfolioAPI.Services;
using CSPortfolioAPI.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers.Application;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class EmailVerificationController(
    UserManager<User> userManager,
    EmailVerificationService emailService,
    JwtTokenHandler tokenService,
    ILogger<EmailVerificationController> logger)
    : ControllerBase
{
    [HttpPost("verify/send")]
    public async Task<IActionResult> SendVerification()
    {
        var user = await userManager.GetUserAsync(User);
        if(user == null)
            return Unauthorized("Invalid user");

        if (user.EmailConfirmed)
            return BadRequest("Email already verified");

        var token = tokenService.GenerateEmailVerificationToken(user.Id);
        await emailService.SendVerificationEmailAsync(user, token);

        return Ok();
    }

    [AllowAnonymous]
    [HttpPost("verify/confirm")]
    public async Task<IActionResult> Confirm([FromQuery] string token)
    {
        var userId = tokenService.ValidateEmailVerificationToken(token);
        
        if (userId is null)
            return BadRequest("Invalid or expired token");

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound();

        user.EmailConfirmed = true;
        await userManager.UpdateAsync(user);

        return Ok();
    }
}
