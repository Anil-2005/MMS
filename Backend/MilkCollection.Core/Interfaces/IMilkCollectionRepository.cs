using MilkCollection.Core.Entities;

namespace MilkCollection.Core.Interfaces;

public interface IMilkCollectionRepository
{
    Task<IEnumerable<Entities.MilkCollection>> GetAllAsync();
    Task<IEnumerable<Entities.MilkCollection>> GetByFarmerIdAsync(int farmerId);
    Task<IEnumerable<Entities.MilkCollection>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<Entities.MilkCollection?> GetByIdAsync(int id);
    Task<Entities.MilkCollection> AddAsync(Entities.MilkCollection milkCollection);
    Task UpdateAsync(Entities.MilkCollection milkCollection);
    Task DeleteAsync(int id);
}