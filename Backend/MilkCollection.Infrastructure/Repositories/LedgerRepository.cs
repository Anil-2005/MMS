using Microsoft.EntityFrameworkCore;
using MilkCollection.Core.Entities;
using MilkCollection.Core.Interfaces;
using MilkCollection.Infrastructure.Data;

namespace MilkCollection.Infrastructure.Repositories;

public class LedgerRepository : ILedgerRepository
{
    private readonly ApplicationDbContext _context;

    public LedgerRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LedgerEntry>> GetByFarmerIdAsync(int farmerId)
    {
        return await _context.LedgerEntries
            .Where(l => l.FarmerId == farmerId)
            .OrderBy(l => l.TransactionDate)
            .ToListAsync();
    }

    public async Task<LedgerEntry> AddAsync(LedgerEntry ledgerEntry)
    {
        _context.LedgerEntries.Add(ledgerEntry);
        await _context.SaveChangesAsync();
        return ledgerEntry;
    }

    public async Task<decimal> GetFarmerBalanceAsync(int farmerId)
    {
        var lastEntry = await _context.LedgerEntries
            .Where(l => l.FarmerId == farmerId)
            .OrderByDescending(l => l.TransactionDate)
            .FirstOrDefaultAsync();

        return lastEntry?.Balance ?? 0;
    }
}