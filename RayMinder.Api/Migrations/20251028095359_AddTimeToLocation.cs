using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RayMinder.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeToLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "Locations",
                newName: "Time");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Time",
                table: "Locations",
                newName: "Timestamp");
        }
    }
}
