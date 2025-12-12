using FluentResults;

namespace CSPortfolioAPI.Errors;

public class NotAuthorizedError(string message, Dictionary<string, object> metadata, List<IError> reasons)
    : IError
{
    public NotAuthorizedError(string message) : this(message, new Dictionary<string, object>(), [])
    {
    }

    public string Message { get; } = message;
    public Dictionary<string, object> Metadata { get; } = metadata;
    public List<IError> Reasons { get; } = reasons;
}