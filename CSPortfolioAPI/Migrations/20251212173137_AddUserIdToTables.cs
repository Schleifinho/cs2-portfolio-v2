using CSPortfolioAPI.Extensions;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSPortfolioAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "userid",
                table: "transactions",
                type: "text",
                nullable: false,
                defaultValue: "50224640-84e3-45be-9a37-55d100501d26");

            migrationBuilder.AddColumn<string>(
                name: "userid",
                table: "inventoryentries",
                type: "text",
                nullable: false,
                defaultValue: "50224640-84e3-45be-9a37-55d100501d26");

            migrationBuilder.CreateIndex(
                name: "ix_transactions_userid",
                table: "transactions",
                column: "userid");

            migrationBuilder.CreateIndex(
                name: "ix_inventoryentries_userid",
                table: "inventoryentries",
                column: "userid");

            migrationBuilder.AddForeignKey(
                name: "fk_inventoryentries_users_userid",
                table: "inventoryentries",
                column: "userid",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_transactions_users_userid",
                table: "transactions",
                column: "userid",
                principalTable: "AspNetUsers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
            
            migrationBuilder.ExecuteSqlFile("./Sql/Functions/GetDashboardNumbers.psql");
            migrationBuilder.ExecuteSqlFile("./Sql/Views/GetCompleteInventoryEntry.psql");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_inventoryentries_users_userid",
                table: "inventoryentries");

            migrationBuilder.DropForeignKey(
                name: "fk_transactions_users_userid",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "ix_transactions_userid",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "ix_inventoryentries_userid",
                table: "inventoryentries");

            migrationBuilder.DropColumn(
                name: "userid",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "userid",
                table: "inventoryentries");
        }
    }
}
