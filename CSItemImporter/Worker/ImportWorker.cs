using System.Text.Json;
using CSItemImporter.Models;
using CSItemImporter.Options;
using CSItemImporter.Services;
using CSPortfolioLib.Contracts.Controller;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CSItemImporter.Worker;

public class ImportWorker(ILogger<ImportWorker> logger, 
    IServiceProvider serviceProvider, 
    IOptions<WorkerSettings> options, 
    IHostApplicationLifetime appLifetime,
    IItemApi itemsApi) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var processor = scope.ServiceProvider.GetRequiredService<ImportItemService>();
        var bitSkinImporter = scope.ServiceProvider.GetRequiredService<BitSkinImporter>();

        if (false)
        {
            var filePath = options.Value.InputFolder;
            var json = await File.ReadAllTextAsync(filePath);
            
            var jOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            Dictionary<string, ItemLite> input = JsonSerializer.Deserialize<Dictionary<string, ItemLite>>(json, jOptions);

            var items = input.Values
                .GroupBy(x => x.Name)
                .ToDictionary(g => g.Key, g => g.First());
            foreach (var test in items.Keys)
            {
                logger.LogInformation($"Importing item {test}");
                break;
            }

            var asd = await itemsApi.GetItemWithoutIconAsync();
            if (asd.IsSuccessful)
            {
                foreach (var item in asd.Content.OrderBy(x => x.Id))
                {
                    if (items.TryGetValue(item.MarketHashName, out ItemLite details))
                    {
                        logger.LogInformation($"Found item {item.Name}");
                        var extracted = details.Image.Remove(0,
                            "https://community.akamai.steamstatic.com/economy/image/".Length);
                        
                        logger.LogInformation(extracted);
                        item.IconUrl = extracted;
                        var response2 = await itemsApi.UpdateAsync(item);
                        if (response2.IsSuccessful == false)
                        {
                            logger.LogError($"Failed to update {details.Name} - {response2.StatusCode}");
                            break;
                        }
                    }
                    else
                    {
                        logger.LogInformation($"Item {item.Name} not found");
                    }
                }
            }
           
            
        }
        else if (options.Value.UseBitSkins)
        {
            //await bitSkinImporter.ImportNamesFromBitSkinsAsync();
            await bitSkinImporter.UpdateImageUrl2Async();
            
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