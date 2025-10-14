using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSPortfolioAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTransactionIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_transactions_inventoryentryid",
                table: "transactions");

            migrationBuilder.CreateIndex(
                name: "IX_transactions_inventoryentry_type",
                table: "transactions",
                columns: new[] { "inventoryentryid", "type" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_transactions_inventoryentry_type",
                table: "transactions");

            migrationBuilder.CreateIndex(
                name: "ix_transactions_inventoryentryid",
                table: "transactions",
                column: "inventoryentryid");
        }
    }
}
