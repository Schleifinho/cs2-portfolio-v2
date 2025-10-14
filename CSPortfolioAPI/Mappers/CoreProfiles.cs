using AutoMapper;
using CSPortfolioAPI.Models;
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
        CreateMap<PurchaseDto, Transaction>().ReverseMap();
        CreateMap<DashBoardNumbersDto, DashBoardNumbers>().ReverseMap();
        CreateMap<Transaction, PurchaseCompleteDto>()
            .ForMember(dest => dest.ItemId,   opt => opt.MapFrom(src => src.InventoryEntry.Item.Id))
            .ForMember(dest => dest.Name,   opt => opt.MapFrom(src => src.InventoryEntry.Item.Name))
            .ForMember(dest => dest.IconUrl,opt => opt.MapFrom(src => src.InventoryEntry.Item.IconUrl))
            .ReverseMap();
        CreateMap<SaleDto, Transaction>().ReverseMap();
        CreateMap<Transaction, SaleCompleteDto>()
            .ForMember(dest => dest.ItemId,   opt => opt.MapFrom(src => src.InventoryEntry.Item.Id))
            .ForMember(dest => dest.Name,   opt => opt.MapFrom(src => src.InventoryEntry.Item.Name))
            .ForMember(dest => dest.IconUrl,opt => opt.MapFrom(src => src.InventoryEntry.Item.IconUrl))
            .ReverseMap();
        CreateMap<InventoryEntryDto, InventoryEntry>().ReverseMap();
    }
}
