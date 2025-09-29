using AutoMapper;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.Contracts.DTO;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
public abstract class BaseController<TDto, TEntity>(
    ILogger<BaseController<TDto, TEntity>> baseLogger,
    BaseRepository<TEntity> baseRepository,
    IMapper mapper)
    : ControllerBase, IBaseController<TDto>
    where TEntity : class
    where TDto : NullableIdDto
{
    protected readonly IMapper Mapper = mapper;

    [HttpGet]
    public virtual async Task<ActionResult<IEnumerable<TDto>>> GetAllAsync()
    {
        baseLogger.LogInformation($"Get all tournaments");
        return Ok(Mapper.Map<IEnumerable<TDto>>(await baseRepository.GetAllAsync()));
    }

    [HttpGet("{id:int}")]
    public virtual async Task<ActionResult<TDto>> GetByIdAsync(int id)
    {
        baseLogger.LogInformation($"Get all tournaments");
        
        var entity = await baseRepository.GetByIdAsync(id);
        if (entity is null)
        {
            return NotFound($"Tournament {id} not found");
        }
        
        return Ok(Mapper.Map<TDto>(entity));
    }

    [HttpPost]
    public virtual async Task<ActionResult<TDto>> AddAsync([FromBody] TDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        
        baseLogger.LogInformation("Creating ...");
        try
        {
            var tournament = Mapper.Map<TEntity>(dto);
            await baseRepository.AddAsync(tournament);
            var added = Mapper.Map<TDto>(tournament);
            return Created("Created ", added);
        }
        catch (Exception e)
        {
            baseLogger.LogError(e.Message);
            return Problem(e.InnerException?.Message);
        }
    }
    
    [HttpPost("bulk")]
    public virtual async Task<ActionResult<IEnumerable<TDto>>> BulkAddAsync(IEnumerable<TDto> dtos)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        
        try
        {
            var entities = Mapper.Map<IEnumerable<TEntity>>(dtos);
            await baseRepository.BulkAddAsync(entities);
            var added = Mapper.Map<TDto>(entities);
            return Created("Created tournament", added);
        }
        catch (Exception e)
        {
            baseLogger.LogError(e.Message);
            return Problem();
        }
    }
    
    [HttpPut]
    public virtual async Task<ActionResult<TDto>> UpdateTournament([FromBody] TDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        
        if (dto.Id.HasValue == false)
        {
            return BadRequest("Id is required");
        }
        
        try
        {
            var entity = Mapper.Map<TEntity>(dto);
            await baseRepository.UpdateAsync(entity);
            
            return Ok(Mapper.Map<TDto>(entity));
        }
        catch (Exception e)
        {
            baseLogger.LogError(e.Message);
            return Problem();
        }
    }
    
    [HttpDelete("{id}")]
    public virtual async Task<IActionResult> DeleteTournament([FromRoute] int id)
    {
        baseLogger.LogInformation($"Delete tournament: {id}");
        try
        {
            await baseRepository.DeleteAsync(id);
            return Ok($"Deleted tournament: {id}");
        }
        catch (Exception e)
        {
            baseLogger.LogError(e.Message);
            return Problem();
        }
    }
}