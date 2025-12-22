using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.DTOs.BitSkin;
using CSPortfolioLib.DTOs.Item;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;

namespace CSItemImporter.Services;

public class BitSkinImporter(IItemApi itemsApi, IBitSkinsApi bitSkinApi, ILogger<BitSkinImporter> logger)
{
    public async Task<int> ImportNamesFromBitSkinsAsync()
    {
        var response = await bitSkinApi.GetBitSkinItems(new BitSkinRequestDto());
        logger.LogInformation("BitSkin items retrieved");
        logger.LogInformation(response.StatusCode.ToString());
        var count = 0;
        if (response.IsSuccessful)
        {
            var content = response.Content;
            foreach (var item in content)
            {
                try
                {
                    var dto = new ItemDto() { MarketHashName = item.Name, Name = item.Name };
                    await itemsApi.PostItemAsync(dto);
                    count++;
                }
                catch
                {
                    // ignored
                }
            }
        }

        return count;
    }

    public async Task UpdateImageUrlAsync()
    {
        const string prefix =
                "https://community.fastly.steamstatic.com/economy/image/";
        var asd = await itemsApi.GetItemWithoutIconAsync();
        if (asd.IsSuccessful)
        {
            logger.LogInformation($"Success");
            using var client = new HttpClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

            foreach (var item in asd.Content.OrderByDescending(x => x.Id).Skip(141))
            {
                string name = item.Name;
                string url = $"https://steamcommunity.com/market/search?q={name}";
                string html = await client.GetStringAsync(url);
                var doc = new HtmlDocument();
                doc.LoadHtml(html);
                
                var div = doc.DocumentNode.SelectSingleNode(
                    $"//div[@data-hash-name=\"{name}\"]"
                );
                if (div != null)
                {
                    logger.LogInformation(div.ToString());
                    var img = div.SelectSingleNode(".//img");
                    string src = img?.GetAttributeValue("src", null);
                    string? extracted = src.StartsWith(prefix)
                        ? src.Substring(prefix.Length)
                        : null;
                    logger.LogInformation(extracted);
                    item.IconUrl = extracted;
                    var response2 = await itemsApi.UpdateAsync(item);
                    if (response2.IsSuccessful == false)
                    {
                        logger.LogError($"Failed to update {name} - {response2.StatusCode}");
                        break;
                    }

                    logger.LogInformation(response2.IsSuccessful.ToString());
                }
                else
                {
                    logger.LogError($"Failed to find {name}");
                }

                Thread.Sleep(20000);
            }
        }
        else
        {
            logger.LogError($"Failed to request BitSkin");
        }
    }
}