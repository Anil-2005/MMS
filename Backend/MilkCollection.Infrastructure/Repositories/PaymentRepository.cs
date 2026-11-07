using Microsoft.EntityFrameworkCore;
using MilkCollection.Core.Entities;
using MilkCollection.Core.Interfaces;
using MilkCollection.Infrastructure.Data;

namespace MilkCollection.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _context;

    public PaymentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Payment>> GetAllAsync()
    {
        return await _context.Payments
            .Include(p => p.Farmer)
            .ToListAsync();
    }

    public async Task<IEnumerable<Payment>> GetByFarmerIdAsync(int farmerId)
    {
        return await _context.Payments
            .Where(p => p.FarmerId == farmerId)
            .Include(p => p.Farmer)
            .ToListAsync();
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _context.Payments
            .Include(p => p.Farmer)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment> AddAsync(Payment payment)
    {
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task UpdateAsync(Payment payment)
    {
        _context.Entry(payment).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment != null)
        {
            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
        }
    }
}