namespace CSPortfolioAPI.Middlewares;

public class JwtCookieMiddleware
{
    private readonly RequestDelegate _next;

    public JwtCookieMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Check if the cookie exists
        if (context.Request.Cookies.TryGetValue("jwt", out var token))
        {
            // 2. If Authorization header is missing, add it
            if (!context.Request.Headers.ContainsKey("Authorization"))
            {
                context.Request.Headers.Append("Authorization", $"Bearer {token}");
            }
        }

        await _next(context);
    }
}