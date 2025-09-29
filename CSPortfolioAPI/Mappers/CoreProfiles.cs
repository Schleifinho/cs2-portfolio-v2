using AutoMapper;
using CSPortfolioAPI.Models;
using CSPortfolioLib.DTOs.Inventory;
using CSPortfolioLib.DTOs.Item;
using CSPortfolioLib.DTOs.PriceHistory;
using CSPortfolioLib.DTOs.Purchase;
using CSPortfolioLib.DTOs.Sale;

namespace CSPortfolioAPI.Mappers;

public class CoreProfiles : Profile
{
    public CoreProfiles()
    {
        CreateMap<ItemDto, Item>().ReverseMap();
        CreateMap<PriceHistoryDto, PriceHistory>().ReverseMap();
        CreateMap<SaleDto, Sale>().ReverseMap();
        CreateMap<PurchaseDto, Purchase>().ReverseMap();
        CreateMap<InventoryEntryDto, InventoryEntry>().ReverseMap();
    }
}
