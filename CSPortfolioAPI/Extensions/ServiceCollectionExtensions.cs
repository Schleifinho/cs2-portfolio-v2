using System.Security.Claims;
using System.Text;
using CSPortfolioAPI.Contracts;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Options;
using CSPortfolioAPI.Repositories;
using CSPortfolioAPI.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CSPortfolioAPI.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPostgresDbServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add DbContext with PostgreSQL configuration
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<CSDbContext>(options =>
        {
            options.UseNpgsql(connectionString)
            .UseLowerCaseNamingConvention();
        });
        
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
        
        services.Scan(scan => scan
            .FromAssemblyOf<BaseUserSecureRepository<IUserFK>>() // Adjust to point to correct assembly
            .AddClasses(classes => classes
                .AssignableTo(typeof(BaseUserSecureRepository<>)) // all classes derived from BaseRepository<>
                .Where(c => !c.IsAbstract)) // exclude abstract classes (like BaseRepository itself)
            .AsSelf() // register concrete classes as themselves (e.g. TournamentRepository)
            .AsImplementedInterfaces() // if they implement interfaces, register those too
            .WithScopedLifetime()
        );

        return services;
    }
    
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration, IHostEnvironment env)
    {
        var jwtOptions = configuration
            .GetRequiredSection("Jwt")
            .Get<JwtOptions>() ?? throw new InvalidOperationException("Jwt options missing");
        
        services.Configure<JwtOptions>(options =>
        {
            options.Issuer = jwtOptions.Issuer;
            options.Audience = jwtOptions.Audience;
            options.SecretKey = jwtOptions.SecretKey;
        });
        
        services.AddScoped<JwtTokenHandler>();
        
        services.Configure<IdentityOptions>(options =>
        {
            // Password settings
            options.Password.RequireDigit = false; // Require at least one digit
            options.Password.RequireLowercase = true; // Require at least one lowercase letter
            options.Password.RequireUppercase = false; // Require at least one uppercase letter
            options.Password.RequireNonAlphanumeric = false; // Don't require special characters
            options.Password.RequiredLength = 2; // Minimum password length
            options.Password.RequiredUniqueChars = 1; // Minimum unique characters
        });

        services.AddIdentity<User, IdentityRole>()
            .AddEntityFrameworkStores<CSDbContext>()
            .AddDefaultTokenProviders();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                RoleClaimType = ClaimTypes.Role,
                NameClaimType = ClaimTypes.NameIdentifier,
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidIssuer = jwtOptions.Issuer, // Set this in appsettings.json
                ValidAudience = jwtOptions.Audience, // Set this in appsettings.json
                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtOptions.SecretKey)), 
            };
        });

        services.AddAuthorization(options =>
        {
            // Define a policy named "DevAllowAll"
            options.AddPolicy(AppPolicies.DevAllowAll, policy =>
            {
                if (env.IsDevelopment())
                {
                    // Always succeed in dev
                    //policy.RequireAuthenticatedUser();
                    policy.RequireAssertion(_ => true);
                }
                else
                {
                    // Require authenticated user otherwise
                    policy.RequireAuthenticatedUser();
                }
            });

            options.AddPolicy(AppPolicies.CanRead, p =>
                p.RequireAuthenticatedUser());

            options.AddPolicy(AppPolicies.CanModerate, p =>
                p.RequireAssertion(c =>
                    c.User.IsInRole(AppRoles.Mod) ||
                    c.User.IsInRole(AppRoles.Admin)));

            options.AddPolicy(AppPolicies.CanAdmin, p =>
                p.RequireRole(AppRoles.Admin));
            
            // Make "DevAllowAll" the default policy so it's applied globally
            options.DefaultPolicy = options.GetPolicy(AppPolicies.DevAllowAll)!;
        });
        
        return services;
    }
}