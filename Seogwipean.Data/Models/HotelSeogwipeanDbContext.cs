using Microsoft.EntityFrameworkCore;

namespace Seogwipean.Data.Models
{
    public partial class HotelSeogwipeanDbContext : DbContext
    {
        public HotelSeogwipeanDbContext()
        {
        }

        public HotelSeogwipeanDbContext(DbContextOptions<HotelSeogwipeanDbContext> options)
            : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=tcp:hoonlee.database.windows.net,1433;Initial Catalog=hoonlee;Persist Security Info=False;User ID=hacker011;Password=tkdgns85!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;");
            }
        }

    }
}
