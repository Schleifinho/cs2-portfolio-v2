using CSPortfolioAPI.Models;
using FluentResults;
using Microsoft.EntityFrameworkCore;

namespace CSPortfolioAPI.Repositories;

public class DashBoardRepository(CSDbContext context) : BaseUserSecureRepository<InventoryEntry>(context)
{
    public async Task<Result<DashBoardNumbers>> GetDashBoardNumbers(string userid, DateTimeOffset startDate)
    {
        // Call the database function
        var conv = startDate.UtcDateTime;

        var result = await Context.DashboardNumbers
            .FromSqlInterpolated($"SELECT * FROM get_dashboard_numbers({userid}, {conv})")
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (result == null)
        {
            return Result.Fail<DashBoardNumbers>($"No Dashboard Numbers found");
        }
        return result;
    }
}