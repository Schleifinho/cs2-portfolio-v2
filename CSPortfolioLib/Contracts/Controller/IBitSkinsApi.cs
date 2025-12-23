using CSPortfolioLib.DTOs.BitSkin;
using Refit;

namespace CSPortfolioLib.Contracts.Controller;

public interface IBitSkinsApi
{
    [Get("/market/skin/730")]
    Task<ApiResponse<List<BitSkinItemDto>>> GetBitSkinItems([Body] BitSkinRequestDto requestDto);
}