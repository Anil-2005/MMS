using Microsoft.AspNetCore.Mvc;
using MilkCollection.Core.Entities;
using MilkCollection.Core.Interfaces;

namespace MilkCollection.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentRepository _paymentRepo;
    private readonly IFarmerRepository _farmerRepo;
    private readonly ILedgerRepository _ledgerRepo;

    public PaymentsController(IPaymentRepository paymentRepo, IFarmerRepository farmerRepo, ILedgerRepository ledgerRepo)
    {
        _paymentRepo = paymentRepo;
        _farmerRepo  = farmerRepo;
        _ledgerRepo  = ledgerRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _paymentRepo.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var p = await _paymentRepo.GetByIdAsync(id);
        return p == null ? NotFound() : Ok(p);
    }

    [HttpGet("farmer/{farmerId}")]
    public async Task<IActionResult> GetByFarmer(int farmerId)
        => Ok(await _paymentRepo.GetByFarmerIdAsync(farmerId));

    [HttpGet("date-range")]
    public async Task<IActionResult> GetByDateRange(
        [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var all = await _paymentRepo.GetAllAsync();
        var filtered = all.Where(p => p.PaymentDate >= startDate.Date && p.PaymentDate <= endDate.Date.AddDays(1).AddTicks(-1));
        return Ok(filtered);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Payment payment)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        payment.PaymentDate = DateTime.Now;
        var saved = await _paymentRepo.AddAsync(payment);

        // Update farmer account balance (payment reduces amount owed to farmer)
        var farmer = await _farmerRepo.GetByIdAsync(payment.FarmerId);
        if (farmer != null)
        {
            farmer.AccountBalance -= payment.Amount;
            await _farmerRepo.UpdateAsync(farmer);
        }

        // Auto-create ledger entry (credit reduces balance owed to farmer)
        var currentBalance = await _ledgerRepo.GetFarmerBalanceAsync(payment.FarmerId);
        await _ledgerRepo.AddAsync(new LedgerEntry
        {
            FarmerId        = payment.FarmerId,
            TransactionDate = payment.PaymentDate,
            Description     = $"Payment — {payment.PaymentMethod}",
            DebitAmount     = 0,
            CreditAmount    = payment.Amount,
            Balance         = currentBalance - payment.Amount,
            EntryType       = LedgerEntryType.Payment,
            ReferenceId     = saved.Id
        });

        return CreatedAtAction(nameof(Get), new { id = saved.Id }, saved);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _paymentRepo.GetByIdAsync(id);
        if (p == null) return NotFound();

        // Revert farmer account balance
        var farmer = await _farmerRepo.GetByIdAsync(p.FarmerId);
        if (farmer != null)
        {
            farmer.AccountBalance += p.Amount;
            await _farmerRepo.UpdateAsync(farmer);
        }

        // Add reversal entry to ledger
        var currentBalance = await _ledgerRepo.GetFarmerBalanceAsync(p.FarmerId);
        await _ledgerRepo.AddAsync(new LedgerEntry
        {
            FarmerId        = p.FarmerId,
            TransactionDate = DateTime.Now,
            Description     = $"Payment Reversal — #{p.Id}",
            DebitAmount     = p.Amount,
            CreditAmount    = 0,
            Balance         = currentBalance + p.Amount,
            EntryType       = LedgerEntryType.Adjustment,
            ReferenceId     = p.Id
        });

        await _paymentRepo.DeleteAsync(id);
        return NoContent();
    }
}
