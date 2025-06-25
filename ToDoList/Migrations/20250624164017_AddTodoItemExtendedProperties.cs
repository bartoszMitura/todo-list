using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToDoList.Migrations
{
    /// <inheritdoc />
    public partial class AddTodoItemExtendedProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "TodoItems",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndTime",
                table: "TodoItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "TodoItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "TodoItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "TodoItems",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Category", "CreatedAt", "EndTime", "StartTime", "Status" },
                values: new object[] { null, new DateTime(2025, 6, 24, 16, 40, 15, 756, DateTimeKind.Utc).AddTicks(2557), null, null, 0 });

            migrationBuilder.UpdateData(
                table: "TodoItems",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Category", "CreatedAt", "EndTime", "StartTime", "Status" },
                values: new object[] { null, new DateTime(2025, 6, 24, 16, 40, 15, 756, DateTimeKind.Utc).AddTicks(4031), null, null, 0 });

            migrationBuilder.UpdateData(
                table: "TodoItems",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Category", "CreatedAt", "EndTime", "StartTime", "Status" },
                values: new object[] { null, new DateTime(2025, 6, 24, 16, 40, 15, 756, DateTimeKind.Utc).AddTicks(4036), null, null, 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "TodoItems");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "TodoItems");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "TodoItems");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "TodoItems");

            migrationBuilder.UpdateData(
                table: "TodoItems",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2025, 6, 8, 19, 38, 10, 116, DateTimeKind.Utc).AddTicks(8242));

            migrationBuilder.UpdateData(
                table: "TodoItems",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2025, 6, 8, 19, 38, 10, 116, DateTimeKind.Utc).AddTicks(8970));

            migrationBuilder.UpdateData(
                table: "TodoItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2025, 6, 8, 19, 38, 10, 116, DateTimeKind.Utc).AddTicks(8973));
        }
    }
}
