using CSPortfolioLib.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Refit;

namespace CSPortfolioLib.Extensions;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddApiRefitClient<T>(
        this IServiceCollection services) where T : class
    {
        services.AddRefitClient<T>()
            .ConfigureHttpClient((sp, c) =>
            {
                var settings = sp.GetRequiredService<IOptions<ApiSettings>>().Value;
                c.BaseAddress = new Uri(settings.Url);
                c.Timeout = TimeSpan.FromSeconds(settings.Timeout); 
            });
        
        return services;
    }
    
    public static IServiceCollection AddSteamRefitClient<T>(
        this IServiceCollection services) where T : class
    {
        services.AddRefitClient<T>()
            .ConfigureHttpClient((sp, c) =>
            {
                var settings = sp.GetRequiredService<IOptions<ApiSettings>>().Value;
                c.BaseAddress = new Uri(settings.SteamUrl);
                c.Timeout = TimeSpan.FromSeconds(settings.Timeout); 
            });
        
        return services;
    }
}