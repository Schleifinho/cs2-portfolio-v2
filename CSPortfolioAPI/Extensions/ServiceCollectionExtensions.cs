using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPostgresDbServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add DbContext with PostgreSQL configuration
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<CSDbContext>(options => { options.UseNpgsql(connectionString); });
        
        var masstransitConnectionString = configuration.GetConnectionString("MassTransitConnection") ??
                                          "UserName=root;Password=root;Server=masstransit-db;Database=masstransit;";
        services.AddDbContext<MassTransitDbContext>(options => { options.UseNpgsql(masstransitConnectionString); });
        return services;
    }
    
    public static IServiceCollection AddRepositoryServices(this IServiceCollection services)
    {
        // Register repositories using Scrutor
        services.Scan(scan => scan
            .FromAssemblyOf<BaseRepository<object>>() // Adjust to point to correct assembly
            .AddClasses(classes => classes
                .AssignableTo(typeof(BaseRepository<>)) // all classes derived from BaseRepository<>
                .Where(c => !c.IsAbstract)) // exclude abstract classes (like BaseRepository itself)
            .AsSelf() // register concrete classes as themselves (e.g. TournamentRepository)
            .AsImplementedInterfaces() // if they implement interfaces, register those too
            .WithScopedLifetime()
        );

        return services;
    }
}