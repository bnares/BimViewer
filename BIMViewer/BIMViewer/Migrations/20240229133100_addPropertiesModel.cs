using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BIMViewer.Migrations
{
    /// <inheritdoc />
    public partial class addPropertiesModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IfcName",
                table: "Models",
                newName: "FileName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FileName",
                table: "Models",
                newName: "IfcName");
        }
    }
}
