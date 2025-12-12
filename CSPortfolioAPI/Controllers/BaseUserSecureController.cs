using AutoMapper;
using CSPortfolioAPI.Contracts;
using CSPortfolioAPI.Models;
using CSPortfolioAPI.Repositories;
using CSPortfolioLib.Contracts.Controller;
using CSPortfolioLib.Contracts.DTO;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CSPortfolioAPI.Controllers;

[ApiController]
public abstract class BaseUserSecureController<TDto, TEntity>(
    ILogger<BaseUserSecureController<TDto, TEntity>> baseLogger,
    BaseUserSecureRepository<TEntity> baseRepository,
    UserManager<User> userManager,
    IMapper mapper)
    : ControllerBase, IBaseController<TDto>
    where TEntity : class, IUserFK
    where TDto : NullableIdDto
{
    protected readonly IMapper Mapper = mapper;

    [HttpGet]
    public virtual async Task<ActionResult<IEnumerable<TDto>>> GetAllAsync(int? page, int? pageSize)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        baseLogger.LogInformation($"Get all tournaments");
        return Ok(Mapper.Map<IEnumerable<TDto>>(await baseRepository.GetAllAsync(userId, page, pageSize)));
    }

    [HttpGet("{id:int}")]
    public virtual async Task<ActionResult<TDto>> GetByIdAsync(int id)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        baseLogger.LogInformation($"Get all tournaments");
        
        var entity = await baseRepository.GetByIdAsync(userId, id);
        if (entity is null)
        {
            return NotFound($"Tournament {id} not found");
        }
        
        return Ok(Mapper.Map<TDto>(entity));
    }

    [HttpPost]
    public virtual async Task<ActionResult<TDto>> AddAsync([FromBody] TDto dto)
    {
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        
        baseLogger.LogInformation("Creating ...");
        try
        {
            var tournament = Mapper.Map<TEntity>(dto);
            await baseRepository.AddAsync(userId, tournament);
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
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        
        try
        {
            var entities = Mapper.Map<IEnumerable<TEntity>>(dtos).ToList();
            await baseRepository.BulkAddAsync(userId, entities);
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
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);
        
        if (dto.Id.HasValue == false)
        {
            return BadRequest("Id is required");
        }
        
        try
        {
            var entity = Mapper.Map<TEntity>(dto);
            await baseRepository.UpdateAsync(userId, entity);
            
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
        var userId = userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized("You are not logged in");
        }
        
        baseLogger.LogInformation($"Delete tournament: {id}");
        try
        {
            await baseRepository.DeleteAsync(userId, id);
            return Ok($"Deleted tournament: {id}");
        }
        catch (Exception e)
        {
            baseLogger.LogError(e.Message);
            return Problem();
        }
    }
}