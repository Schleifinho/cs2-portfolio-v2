using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioLib.Contracts.Controller;

public interface IBaseController<TDto>
{
    Task<ActionResult<IEnumerable<TDto>>> GetAllAsync(int? page = null, int? pageSize = null);
    Task<ActionResult<TDto>> AddAsync(TDto dto);
    Task<ActionResult<IEnumerable<TDto>>> BulkAddAsync(IEnumerable<TDto> dto);
    Task<ActionResult<TDto>> GetByIdAsync(int id);
    Task<ActionResult<TDto>> UpdateTournament(TDto dto);
}