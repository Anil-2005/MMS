using MilkCollection.Core.Entities;

namespace MilkCollection.Core.Interfaces;

public interface ILedgerRepository
{
    Task<IEnumerable<LedgerEntry>> GetByFarmerIdAsync(int farmerId);
    Task<LedgerEntry> AddAsync(LedgerEntry ledgerEntry);
    Task<decimal> GetFarmerBalanceAsync(int farmerId);
}