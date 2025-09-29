using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController
{
    // GET: /api/hello
    [HttpGet]
    public ActionResult<string> GetGreeting()
    {
        return "Hello from OpenAPI!";
    }

    // GET: /api/hello/{name}
    [HttpGet("{name}")]
    public ActionResult<string> GetPersonalGreeting(string name)
    {
        return $"Hello, {name}!";
    }
}