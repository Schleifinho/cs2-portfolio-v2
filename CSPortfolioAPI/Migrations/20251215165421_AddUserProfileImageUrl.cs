using CSPortfolioAPI.Extensions;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSPortfolioAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileImageUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "profileimageurl",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
            migrationBuilder.ExecuteSqlFile("./Sql/Functions/CreatePriceHyperTable.psql");
            migrationBuilder.ExecuteSqlFile("./Sql/Views/GetCompleteInventoryEntry.psql");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "profileimageurl",
                table: "AspNetUsers");
        }
    }
}
