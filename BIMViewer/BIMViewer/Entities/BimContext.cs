using Microsoft.EntityFrameworkCore;

namespace BIMViewer.Entities
{
    public class BimContext : DbContext
    {
        public BimContext(DbContextOptions<BimContext> options) : base(options) 
        {
                
        }

        public DbSet<Model> Models { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<Model>(item =>
            {
                item.Property(x => x.Name).HasColumnType("varchar(50)").IsRequired();
                item.Property(x => x.Description).HasColumnType("varchar(300)").IsRequired();
                item.Property(x => x.Status).HasColumnType("varchar(30)").IsRequired();
                item.Property(x => x.ModelProperties).HasColumnType("NVARCHAR(MAX)");
            });
        }
    }
}
