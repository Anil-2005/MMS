using Microsoft.EntityFrameworkCore;
using MilkCollection.Core.Interfaces;
using MilkCollection.Infrastructure.Data;

namespace MilkCollection.Infrastructure.Repositories;

public class MilkCollectionRepository : IMilkCollectionRepository
{
    private readonly ApplicationDbContext _context;

    public MilkCollectionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Core.Entities.MilkCollection>> GetAllAsync()
    {
        return await _context.MilkCollections
            .Include(m => m.Farmer)
            .ToListAsync();
    }

    public async Task<IEnumerable<Core.Entities.MilkCollection>> GetByFarmerIdAsync(int farmerId)
    {
        return await _context.MilkCollections
            .Where(m => m.FarmerId == farmerId)
            .Include(m => m.Farmer)
            .ToListAsync();
    }

    public async Task<IEnumerable<Core.Entities.MilkCollection>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.MilkCollections
            .Where(m => m.CollectionDate >= startDate && m.CollectionDate <= endDate)
            .Include(m => m.Farmer)
            .OrderByDescending(m => m.CollectionDate)
            .ToListAsync();
    }

    public async Task<Core.Entities.MilkCollection?> GetByIdAsync(int id)
    {
        return await _context.MilkCollections
            .Include(m => m.Farmer)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<Core.Entities.MilkCollection> AddAsync(Core.Entities.MilkCollection milkCollection)
    {
        _context.MilkCollections.Add(milkCollection);
        await _context.SaveChangesAsync();
        return milkCollection;
    }

    public async Task UpdateAsync(Core.Entities.MilkCollection milkCollection)
    {
        _context.Entry(milkCollection).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var milkCollection = await _context.MilkCollections.FindAsync(id);
        if (milkCollection != null)
        {
            _context.MilkCollections.Remove(milkCollection);
            await _context.SaveChangesAsync();
        }
    }
}