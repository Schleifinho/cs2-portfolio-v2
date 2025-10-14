using CSPortfolioAPI.Models;
using FluentResults;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class DashBoardRepository(CSDbContext context) : BaseRepository<InventoryEntry>(context)
{
    public async Task<Result<DashBoardNumbers>> GetDashBoardNumbers(DateTimeOffset startDate)
    {
        // Call the database function

        var conv = startDate.UtcDateTime;

        var result = await Context.DashboardNumbers
            .FromSqlInterpolated($"SELECT * FROM get_dashboard_numbers({conv})")
            .AsNoTracking()
            .FirstOrDefaultAsync();
        

        if (result == null)
        {
            return Result.Fail<DashBoardNumbers>($"No Dashboard Numbers found");
        }
        return result;
    }
}