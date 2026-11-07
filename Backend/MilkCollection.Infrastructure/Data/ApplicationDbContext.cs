using Microsoft.EntityFrameworkCore;
using MilkCollection.Core.Entities;

namespace MilkCollection.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Farmer> Farmers { get; set; }
    public DbSet<Core.Entities.MilkCollection> MilkCollections { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<LedgerEntry> LedgerEntries { get; set; }
    public DbSet<RateChart> RateCharts { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Farmer configuration
        modelBuilder.Entity<Farmer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FarmerCode).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(15);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.AccountBalance).HasPrecision(18, 2);
            entity.HasIndex(e => e.FarmerCode).IsUnique();
        });

        // MilkCollection configuration
        modelBuilder.Entity<Core.Entities.MilkCollection>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(8, 2);
            entity.Property(e => e.FatPercentage).HasPrecision(5, 2);
            entity.Property(e => e.SnfPercentage).HasPrecision(5, 2);
            entity.Property(e => e.RatePerLiter).HasPrecision(8, 2);
            entity.Property(e => e.TotalAmount).HasPrecision(10, 2);

            entity.HasOne(e => e.Farmer)
                  .WithMany(e => e.MilkCollections)
                  .HasForeignKey(e => e.FarmerId);
        });

        // Payment configuration
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.ReferenceNumber).HasMaxLength(50);
            entity.Property(e => e.Remarks).HasMaxLength(500);

            entity.HasOne(e => e.Farmer)
                  .WithMany(e => e.Payments)
                  .HasForeignKey(e => e.FarmerId);
        });

        // LedgerEntry configuration
        modelBuilder.Entity<LedgerEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(200);
            entity.Property(e => e.DebitAmount).HasPrecision(10, 2);
            entity.Property(e => e.CreditAmount).HasPrecision(10, 2);
            entity.Property(e => e.Balance).HasPrecision(10, 2);

            entity.HasOne(e => e.Farmer)
                  .WithMany(e => e.LedgerEntries)
                  .HasForeignKey(e => e.FarmerId);
        });

        // RateChart configuration
        modelBuilder.Entity<RateChart>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MinFatPercentage).HasPrecision(5, 2);
            entity.Property(e => e.MaxFatPercentage).HasPrecision(5, 2);
            entity.Property(e => e.MinSnfPercentage).HasPrecision(5, 2);
            entity.Property(e => e.MaxSnfPercentage).HasPrecision(5, 2);
            entity.Property(e => e.RatePerLiter).HasPrecision(8, 2);
        });

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(20);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasOne(e => e.Farmer)
                  .WithMany()
                  .HasForeignKey(e => e.FarmerId)
                  .IsRequired(false);
        });
    }
}