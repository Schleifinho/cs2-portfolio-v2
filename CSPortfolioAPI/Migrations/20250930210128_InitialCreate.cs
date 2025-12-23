using System;
using CSPortfolioAPI.Extensions;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CSPortfolioAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "items",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    markethashname = table.Column<string>(type: "text", nullable: false),
                    iconurl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_items", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "inventoryentries",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    itemid = table.Column<int>(type: "integer", nullable: false),
                    quantityonhand = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inventoryentries", x => x.id);
                    table.ForeignKey(
                        name: "fk_inventoryentries_items_itemid",
                        column: x => x.itemid,
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "pricehistories",
                columns: table => new
                {
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    itemid = table.Column<int>(type: "integer", nullable: false),
                    price = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_pricehistories", x => new { x.itemid, x.timestamp });
                    table.ForeignKey(
                        name: "fk_pricehistories_items_itemid",
                        column: x => x.itemid,
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transactions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    inventoryentryid = table.Column<int>(type: "integer", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    price = table.Column<double>(type: "double precision", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_transactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_transactions_inventoryentries_inventoryentryid",
                        column: x => x.inventoryentryid,
                        principalTable: "inventoryentries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_inventoryentries_itemid",
                table: "inventoryentries",
                column: "itemid");

            migrationBuilder.CreateIndex(
                name: "ix_items_markethashname",
                table: "items",
                column: "markethashname",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_transactions_inventoryentryid",
                table: "transactions",
                column: "inventoryentryid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "pricehistories");

            migrationBuilder.DropTable(
                name: "transactions");

            migrationBuilder.DropTable(
                name: "inventoryentries");

            migrationBuilder.DropTable(
                name: "items");
        }
    }
}
