using CSItemImporter.Options;
using CSItemImporter.Services;
using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.Extensions;
using CSPortfolioLib.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace CSItemImporter;

public static class Program
{
    public static async Task Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);

        // Bind ApiSettings from config
        builder.Services.Configure<ApiSettings>(
            builder.Configuration.GetSection(nameof(ApiSettings)));
        
        builder.Services.Configure<WorkerSettings>(
            builder.Configuration.GetSection(nameof(WorkerSettings)));

        // Register Refit client using settings
        builder.Services.AddApiRefitClient<IItemApi>();

        // Register your custom services
        builder.Services.AddScoped<ImportItemService>();

        // Add background worker
        builder.Services.AddHostedService<ImportWorker>();

        var app = builder.Build();
        await app.RunAsync();
    }
}