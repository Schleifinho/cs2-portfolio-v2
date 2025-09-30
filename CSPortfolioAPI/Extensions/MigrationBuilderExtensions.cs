using System.Reflection;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CSPortfolioAPI.Extensions;

public static class MigrationBuilderExtensions
{
    /// <summary>
    /// Executes a SQL script from an embedded resource or file path during a migration.
    /// </summary>
    /// <param name="migrationBuilder">MigrationBuilder instance</param>
    /// <param name="sqlFilePath">Relative file path or embedded resource name</param>
    public static void ExecuteSqlFile(this MigrationBuilder migrationBuilder, string sqlFilePath)
    {
        if (string.IsNullOrWhiteSpace(sqlFilePath))
            throw new ArgumentException("SQL file path must be provided.", nameof(sqlFilePath));

        string sql;

        // Try load as embedded resource
        var assembly = Assembly.GetExecutingAssembly();
        using (var stream = assembly.GetManifestResourceStream(sqlFilePath))
        {
            if (stream != null)
            {
                using (var reader = new StreamReader(stream))
                {
                    sql = reader.ReadToEnd();
                }
            }
            else if (File.Exists(sqlFilePath)) // fallback to file system path
            {
                sql = File.ReadAllText(sqlFilePath);
            }
            else
            {
                throw new FileNotFoundException($"SQL file not found as embedded resource or file: {sqlFilePath}");
            }
        }

        if (!string.IsNullOrWhiteSpace(sql))
        {
            migrationBuilder.Sql(sql);
        }
    }
}