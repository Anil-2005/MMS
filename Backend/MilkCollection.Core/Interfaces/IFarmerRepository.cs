using MilkCollection.Core.Entities;

namespace MilkCollection.Core.Interfaces;

public interface IFarmerRepository
{
    Task<IEnumerable<Farmer>> GetAllAsync();
    Task<Farmer?> GetByIdAsync(int id);
    Task<Farmer?> GetByCodeAsync(string farmerCode);
    Task<Farmer> AddAsync(Farmer farmer);
    Task UpdateAsync(Farmer farmer);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}