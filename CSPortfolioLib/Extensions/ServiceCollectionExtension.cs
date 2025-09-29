using CSPortfolioLib.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Refit;

namespace CSPortfolioLib.Extensions;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddApiRefitClient<T>(
        this IServiceCollection services, string path) where T : class
    {
        services.AddRefitClient<T>()
            .ConfigureHttpClient((sp, c) =>
            {
                var settings = sp.GetRequiredService<IOptions<ApiSettings>>().Value;
                c.BaseAddress = new Uri($"{settings.Url}:{settings.Port}/api/{path}");
                c.Timeout = TimeSpan.FromSeconds(60); 
            });
        
        return services;
    }
}