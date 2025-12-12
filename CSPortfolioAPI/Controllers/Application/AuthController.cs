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

        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        return Ok(new { message = "User registered successfully" });
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

        return Ok(new { Message = "Successful logged in." });
    }
    
    // This route doesn't really do anything to the JWT token itself
    // The client should remove the token from the browser (localStorage, cookies, etc.)
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Since JWT is stateless, the server doesn't need to handle anything
        // The client simply removes the JWT token from localStorage or cookies

        return Ok(new { message = "Logged out successfully." });
    }
}