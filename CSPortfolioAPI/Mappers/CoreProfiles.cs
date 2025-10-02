using AutoMapper;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Models.Views;
using CSPortfolioLib.DTOs.Inventory;
using CSPortfolioLib.DTOs.Item;
using CSPortfolioLib.DTOs.PriceHistory;
using CSPortfolioLib.DTOs.Purchase;
using CSPortfolioLib.DTOs.Sale;
using CSPortfolioLib.DTOs.Transaction;

namespace CSPortfolioAPI.Mappers;

public class CoreProfiles : Profile
{
    public CoreProfiles()
    {
        CreateMap<ItemDto, Item>().ReverseMap();
        CreateMap<PriceHistoryDto, PriceHistory>().ReverseMap();
        CreateMap<TransactionDto, Transaction>().ReverseMap();
        CreateMap<PurchaseResponseDto, Transaction>().ReverseMap();
        CreateMap<SaleDto, Transaction>().ReverseMap();
        CreateMap<InventoryEntryDto, InventoryEntry>().ReverseMap();
    }
}
