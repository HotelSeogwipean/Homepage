using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Seogwipean.Data.Models
{
    public partial class SeogwipeanDbContext : DbContext
    {
        public SeogwipeanDbContext()
        {
        }

        public SeogwipeanDbContext(DbContextOptions<SeogwipeanDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Surf> Surf { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                optionsBuilder.UseSqlServer("Server=tcp:seogwipean.database.windows.net,1433;Initial Catalog=seogwipean;Persist Security Info=False;User ID=hacker010;Password=tkdgns85@;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Surf>(entity =>
            {
                entity.Property(e => e.CreateDate).HasColumnType("date");

                entity.Property(e => e.Email)
                    .HasMaxLength(150)
                    .IsUnicode(false);

                entity.Property(e => e.Phone)
                    .IsRequired()
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Request).IsUnicode(false);

                entity.Property(e => e.StartDate).HasColumnType("date");

                entity.Property(e => e.UserName)
                    .IsRequired()
                    .HasMaxLength(100)
                    .IsUnicode(false);
            });
        }
    }
}
