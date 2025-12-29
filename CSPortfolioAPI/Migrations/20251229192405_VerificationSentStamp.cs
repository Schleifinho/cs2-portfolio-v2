using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSPortfolioAPI.Migrations
{
    /// <inheritdoc />
    public partial class VerificationSentStamp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "lastverificationemailsentat",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "lastverificationemailsentat",
                table: "AspNetUsers");
        }
    }
}
