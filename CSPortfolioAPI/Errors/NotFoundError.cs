using FluentResults;

namespace CSPortfolioAPI.Errors;

public class NotFoundError : IError
{
    public NotFoundError(string message, Dictionary<string, object> metadata, List<IError> reasons)
    {
        Message = message;
        Metadata = metadata;
        Reasons = reasons;
    }
    
    public NotFoundError(string message)
    {
        Message = message;
    }

    public string Message { get; }
    public Dictionary<string, object> Metadata { get; }
    public List<IError> Reasons { get; }
}