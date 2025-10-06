using CSPortfolioAPI.Errors;
using FluentResults;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Extensions;

public static class ActionResultExtensions
{
    public static ActionResult ToActionResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
            return new OkObjectResult(result.Value);

        // Look for a typed error first
        foreach (var error in result.Errors)
        {
            switch (error)
            {
                case NotFoundError:
                    return new NotFoundObjectResult(error.Message);
                case BadRequestError:
                    return new BadRequestObjectResult(error.Message);
            }

        }

        // Fallback for unknown errors
        return new ObjectResult(result.Errors.First().Message) { StatusCode = 500 };
    }
    
    public static ActionResult ToActionResult(this Result result)
    {
        if (result.IsSuccess)
            return new OkObjectResult(result);

        // Look for a typed error first
        foreach (var error in result.Errors)
        {
            switch (error)
            {
                case NotFoundError:
                    return new NotFoundObjectResult(error.Message);
                case BadRequestError:
                    return new BadRequestObjectResult(error.Message);
            }

        }

        // Fallback for unknown errors
        return new ObjectResult(result.Errors.First().Message) { StatusCode = 500 };
    }
}