using CSPortfolioAPI.Extensions;
using CSPortfolioAPI.Models;
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
});
builder.Services.AddControllers();

builder.Services.AddPostgresDbServices(builder.Configuration);
builder.Services.AddRepositoryServices();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSwagger",
        policy => policy
            .AllowAnyOrigin()    // or restrict to the UI origin
            .AllowAnyMethod()
            .AllowAnyHeader());
});

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

#region Run APP
var app = builder.Build();
Console.WriteLine($"Running {app.Environment.EnvironmentName}");

#endregion

app.UseCors("AllowSwagger");

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