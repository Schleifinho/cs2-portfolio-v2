using CSPortfolioAPI.Models;
using CSPortfolioAPI.Utils;
using CSPortfolioLib.DTOs.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers.Application;

[Route("api/[controller]")]
[ApiController]
public class AuthController(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    JwtTokenHandler jwtTokenHandler,
    ILogger<AuthController> logger)
    : ControllerBase
{
    // Registration Endpoint
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
    {
        logger.LogInformation($"=== Register User {dto} ===");
        
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        
        var token = jwtTokenHandler.GenerateJwtTokenForUser(user);
        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(14)
        });

        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        return Ok(new UserDto(){ Username = user.UserName, Email = user.Email });
    }

    // Login Endpoint
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var user = await userManager.FindByNameAsync(dto.Username);

        if (user == null)
            return Unauthorized("Invalid credentials");

        var result = await signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

        if (!result.Succeeded)
            return Unauthorized("Invalid credentials");

        var token = jwtTokenHandler.GenerateJwtTokenForUser(user);
        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(14)
        });

        return Ok(new UserDto(){ Username = user.UserName, Email = user.Email });
    }
    
    // This route doesn't really do anything to the JWT token itself
    // The client should remove the token from the browser (localStorage, cookies, etc.)
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Append("jwt", "",
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddSeconds(-1)
            });

        return Ok(new { message = "Logged out successfully" });
    }
}