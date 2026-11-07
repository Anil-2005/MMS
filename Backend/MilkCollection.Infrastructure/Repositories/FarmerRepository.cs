using Microsoft.EntityFrameworkCore;
using MilkCollection.Core.Entities;
using MilkCollection.Core.Interfaces;
using MilkCollection.Infrastructure.Data;

namespace MilkCollection.Infrastructure.Repositories;

public class FarmerRepository : IFarmerRepository
{
    private readonly ApplicationDbContext _context;

    public FarmerRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Farmer>> GetAllAsync()
    {
        return await _context.Farmers.ToListAsync();
    }

    public async Task<Farmer?> GetByIdAsync(int id)
    {
        return await _context.Farmers.FindAsync(id);
    }

    public async Task<Farmer?> GetByCodeAsync(string farmerCode)
    {
        return await _context.Farmers.FirstOrDefaultAsync(f => f.FarmerCode == farmerCode);
    }

    public async Task<Farmer> AddAsync(Farmer farmer)
    {
        _context.Farmers.Add(farmer);
        await _context.SaveChangesAsync();
        return farmer;
    }

    public async Task UpdateAsync(Farmer farmer)
    {
        _context.Entry(farmer).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var farmer = await _context.Farmers.FindAsync(id);
        if (farmer != null)
        {
            _context.Farmers.Remove(farmer);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Farmers.AnyAsync(f => f.Id == id);
    }
}