using System.Threading.RateLimiting;
using brevo_csharp.Api;
using brevo_csharp.Client;
using CSPortfolioAPI.Contracts;
using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Middlewares;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Options;
using CSPortfolioAPI.Services;
using CSPortfolioAPI.Utils;
using CSPortfolioLib.Producers;
using MessageBrokerLib.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

#region Configuration
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add controller support
builder.Services.AddSwaggerGen(options =>
{
    // This loads configuration in this order:
    builder.Configuration
        .SetBasePath(builder.Environment.ContentRootPath)
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
        .AddEnvironmentVariables();
    
    // Advertise the externally reachable host:port
    options.AddServer(new OpenApiServer
    {
        Url = "http://localhost:4000"
    });
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CS Portfolio API",
        Version = "v1",
        Description = "API documentation for PUBG Fantasy League",
    });

    // Define the Bearer auth scheme
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer", // IMPORTANT: lowercase "bearer" enables auto prefix
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description =
            "Enter your JWT token. **Do not include 'Bearer '** prefix. It will be added automatically."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddControllers();

builder.Services.AddPostgresDbServices(builder.Configuration);
builder.Services.AddRepositoryServices();
builder.Services.AddIdentityServices(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:4040")
            .WithOrigins("http://localhost:8080")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddRabbitMQProducer(builder.Configuration, 
    cfg => cfg.AddScoped<PriceUpdateEventProducer>());
builder.WebHost.UseWebRoot("wwwroot");

var brevoOptions = builder.Configuration
    .GetRequiredSection("Brevo")
    .Get<BrevoOptions>() ?? throw new InvalidOperationException("Brevo options missing");
        
builder.Services.Configure<BrevoOptions>(options =>
{
    options.ApiKey = brevoOptions.ApiKey;
    options.ApiBaseUrl = brevoOptions.ApiBaseUrl;
    options.SenderName = brevoOptions.SenderName;
    options.SenderEmail = brevoOptions.SenderEmail;
});

builder.Services.AddScoped<ITransactionalEmailsApi, TransactionalEmailsApi>();
builder.Services.AddScoped<IEmailService, BrevoEmailService>();
builder.Services.AddScoped<EmailVerificationService>();

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy(AppRateLimits.EmailVerification, context =>
    {
        // Use user ID if authenticated, otherwise fallback to IP
        var key =
            context.User?.Identity?.IsAuthenticated == true
                ? context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
                : context.Connection.RemoteIpAddress?.ToString() ?? "anonymous";

        return RateLimitPartition.GetFixedWindowLimiter(
            key,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(10),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            });
    });
});

#region Run APP
var app = builder.Build();
Console.WriteLine($"Running {app.Environment.EnvironmentName}");

#endregion

app.UseStaticFiles();

app.UseCors("AllowFrontend");
app.UseRateLimiter();

app.UseHttpsRedirection();
// Make sure we don't have cookie authentication enabled by accident
app.UseRouting();
app.UseMiddleware<JwtCookieMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        // Point to Swashbuckle’s JSON instead of /openapi/v1.json
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CSPortfolio API v1");
    });
}

// Apply pending migrations at startup
using var scope = app.Services.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<CSDbContext>();
dbContext.Database.Migrate();
        
// Masstransit
var dbMassTransitContext = scope.ServiceProvider.GetRequiredService<MassTransitDbContext>();
dbMassTransitContext.Database.Migrate();

await RoleSeeder.SeedAsync(scope.ServiceProvider);

app.Run();

#endregion