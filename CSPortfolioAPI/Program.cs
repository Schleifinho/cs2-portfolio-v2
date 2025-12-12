using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Models;
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
    options.AddPolicy("AllowSwagger",
        policy => policy
            .AllowAnyOrigin()    // or restrict to the UI origin
            .AllowAnyMethod()
            .AllowAnyHeader());
});

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddRabbitMQProducer(builder.Configuration, 
    cfg => cfg.AddScoped<PriceUpdateEventProducer>());

#region Run APP
var app = builder.Build();
Console.WriteLine($"Running {app.Environment.EnvironmentName}");

#endregion

app.UseCors("AllowSwagger");

app.UseHttpsRedirection();
// Make sure we don't have cookie authentication enabled by accident
app.UseRouting();

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

app.Run();

#endregion