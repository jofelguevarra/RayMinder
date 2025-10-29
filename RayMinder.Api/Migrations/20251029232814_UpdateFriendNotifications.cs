using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RayMinder.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFriendNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SenderUsername",
                table: "FriendNotifications",
                newName: "Username");

            migrationBuilder.RenameColumn(
                name: "ReceiverUsername",
                table: "FriendNotifications",
                newName: "Message");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "FriendNotifications",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "FriendNotifications");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "FriendNotifications",
                newName: "SenderUsername");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "FriendNotifications",
                newName: "ReceiverUsername");
        }
    }
}
