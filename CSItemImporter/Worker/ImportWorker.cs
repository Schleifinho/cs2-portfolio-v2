using CSItemImporter.Options;
using CSItemImporter.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CSItemImporter.Worker;

public class ImportWorker(ILogger<ImportWorker> logger, 
    IServiceProvider serviceProvider, 
    IOptions<WorkerSettings> options, 
    IHostApplicationLifetime appLifetime) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var processor = scope.ServiceProvider.GetRequiredService<ImportItemService>();
        var bitSkinImporter = scope.ServiceProvider.GetRequiredService<BitSkinImporter>();

        if (options.Value.UseBitSkins)
        {
            //await bitSkinImporter.ImportNamesFromBitSkinsAsync();
            await bitSkinImporter.UpdateImageUrlAsync();
            
        }
        else
        {
            var folderPath = options.Value.InputFolder;
            logger.LogInformation($"Importing from folder: {folderPath}");
            await processor.ProcessFilesAsync(folderPath);
            logger.LogInformation($"Done");
        }

        appLifetime.StopApplication();
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Stopping...");
        return Task.CompletedTask;
    }
}