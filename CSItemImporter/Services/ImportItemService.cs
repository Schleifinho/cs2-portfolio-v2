using System.Text.Json;
using CSItemImporter.Models;
using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.DTOs.Item;
using Microsoft.Extensions.Logging;

namespace CSItemImporter.Services;

public class ImportItemService(ILogger<ImportItemService> logger, IItemApi api)
{
    public async Task ProcessFilesAsync(string folderPath)
    {
        var files = Directory.GetFiles(folderPath, "*.json", SearchOption.AllDirectories);

        foreach (var file in files)
        {
            try
            {
                var json = await File.ReadAllTextAsync(file);
                var root = JsonSerializer.Deserialize<Root>(json);

                if (root?.Results == null)
                    continue;

                foreach (var result in root.Results)
                {
                    try
                    {
                        var item = new ItemDto
                        {
                            Name = result.Name,
                            MarketHashName = result.AssetDescription?.MarketHashName!,
                            IconUrl = result.AssetDescription?.IconUrl
                        };

                        logger.LogInformation($"Posting item: {item.Name}");
                        await api.PostItemAsync(item);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError($"Item error: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Error reading file {file}: {ex.Message}");
            }
        }

        logger.LogInformation("Finished reading JSON files.");
    }
}