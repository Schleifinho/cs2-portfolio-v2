using System.Text.Json;
using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.DTOs.Item;
using Microsoft.Extensions.Configuration;
using Refit;

namespace CSItemImporter;

public class Program
{
    static async Task Main(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory) // optional if running from bin folder
            .AddJsonFile("./appsettings.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .Build();
        
        // Folder path to search
        string folderPath = @"./Input/current";

        string apiBaseUrl = config["ApiSettings:Url"];
        string apiPort = config["ApiSettings:Port"];
        
        Console.WriteLine($"{apiBaseUrl}:{apiPort}/api");
        var api = RestService.For<IItemApi>($"{apiBaseUrl}:{apiPort}/api");
        
        // Recursively get all .json files
        var files = Directory.GetFiles(folderPath, "*.json", SearchOption.AllDirectories);

        foreach (var file in files)
        {
            try
            {
                string json = await File.ReadAllTextAsync(file);

                var root = JsonSerializer.Deserialize<Root>(json);

                if (root?.Results != null)
                {
                    foreach (var result in root.Results)
                    {
                        try
                        {
                            string name = result.Name;
                            string marketHashName = result.AssetDescription?.MarketHashName;
                            string iconUrl = result.AssetDescription?.IconUrl;

                            var item = new ItemDto
                            {
                                Name = name,
                                MarketHashName = marketHashName,
                                IconUrl = iconUrl
                            };

                            Console.WriteLine($"Name: {name}");
                            Console.WriteLine(new string('-', 50));

                            await api.PostItemAsync(item);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex.Message);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading file {file}: {ex.Message}");
            }
        }

        Console.WriteLine("Finished reading JSON files.");
    }
}