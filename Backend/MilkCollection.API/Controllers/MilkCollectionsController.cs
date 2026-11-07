using Microsoft.AspNetCore.Mvc;
using MilkCollection.Core.Entities;
using MilkCollection.Core.Interfaces;

namespace MilkCollection.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MilkCollectionsController : ControllerBase
{
    private readonly IMilkCollectionRepository _milkRepo;
    private readonly ILedgerRepository _ledgerRepo;
    private readonly IFarmerRepository _farmerRepo;

    public MilkCollectionsController(
        IMilkCollectionRepository milkRepo,
        ILedgerRepository ledgerRepo,
        IFarmerRepository farmerRepo)
    {
        _milkRepo   = milkRepo;
        _ledgerRepo = ledgerRepo;
        _farmerRepo = farmerRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _milkRepo.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var c = await _milkRepo.GetByIdAsync(id);
        return c == null ? NotFound() : Ok(c);
    }

    [HttpGet("farmer/{farmerId}")]
    public async Task<IActionResult> GetByFarmer(int farmerId)
        => Ok(await _milkRepo.GetByFarmerIdAsync(farmerId));

    [HttpGet("date-range")]
    public async Task<IActionResult> GetByDateRange(
        [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        // Use date-only comparison to avoid time-component issues
        var all = await _milkRepo.GetByDateRangeAsync(startDate.Date, endDate.Date.AddDays(1).AddTicks(-1));
        return Ok(all);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Core.Entities.MilkCollection milkCollection)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // Recalculate server-side (single source of truth)
        milkCollection.RatePerLiter = CalculateRate(milkCollection.FatPercentage, milkCollection.SnfPercentage);
        milkCollection.TotalAmount  = Math.Round(milkCollection.Quantity * milkCollection.RatePerLiter, 2);

        var saved = await _milkRepo.AddAsync(milkCollection);

        // Auto-create ledger entry (debit = amount owed to farmer)
        var currentBalance = await _ledgerRepo.GetFarmerBalanceAsync(milkCollection.FarmerId);
        await _ledgerRepo.AddAsync(new LedgerEntry
        {
            FarmerId        = saved.FarmerId,
            TransactionDate = DateTime.Now,
            Description     = $"Milk Collection — {saved.Quantity}L @ ₹{saved.RatePerLiter}/L",
            DebitAmount     = saved.TotalAmount,
            CreditAmount    = 0,
            Balance         = currentBalance + saved.TotalAmount,
            EntryType       = LedgerEntryType.MilkCollection,
            ReferenceId     = saved.Id
        });

        // Update farmer account balance
        var farmer = await _farmerRepo.GetByIdAsync(saved.FarmerId);
        if (farmer != null)
        {
            farmer.AccountBalance += saved.TotalAmount;
            await _farmerRepo.UpdateAsync(farmer);
        }

        return CreatedAtAction(nameof(Get), new { id = saved.Id }, saved);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Core.Entities.MilkCollection milkCollection)
    {
        if (id != milkCollection.Id) return BadRequest();
        var existing = await _milkRepo.GetByIdAsync(id);
        if (existing == null) return NotFound();

        var oldTotal = existing.TotalAmount;

        existing.Quantity = milkCollection.Quantity;
        existing.FatPercentage = milkCollection.FatPercentage;
        existing.SnfPercentage = milkCollection.SnfPercentage;
        existing.CollectionDate = milkCollection.CollectionDate;
        existing.CollectionTime = milkCollection.CollectionTime;
        existing.Remarks = milkCollection.Remarks;
        existing.RatePerLiter = CalculateRate(milkCollection.FatPercentage, milkCollection.SnfPercentage);
        existing.TotalAmount  = Math.Round(milkCollection.Quantity * existing.RatePerLiter, 2);

        await _milkRepo.UpdateAsync(existing);

        var delta = existing.TotalAmount - oldTotal;
        if (delta != 0)
        {
            var farmer = await _farmerRepo.GetByIdAsync(existing.FarmerId);
            if (farmer != null)
            {
                farmer.AccountBalance += delta;
                await _farmerRepo.UpdateAsync(farmer);
            }

            var currentBalance = await _ledgerRepo.GetFarmerBalanceAsync(existing.FarmerId);
            await _ledgerRepo.AddAsync(new LedgerEntry
            {
                FarmerId        = existing.FarmerId,
                TransactionDate = DateTime.Now,
                Description     = $"Milk Collection Adjustment — #{existing.Id}",
                DebitAmount     = delta > 0 ? delta : 0,
                CreditAmount    = delta < 0 ? -delta : 0,
                Balance         = currentBalance + delta,
                EntryType       = LedgerEntryType.Adjustment,
                ReferenceId     = existing.Id
            });
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _milkRepo.GetByIdAsync(id);
        if (c == null) return NotFound();

        // Deduct from farmer account balance
        var farmer = await _farmerRepo.GetByIdAsync(c.FarmerId);
        if (farmer != null)
        {
            farmer.AccountBalance -= c.TotalAmount;
            await _farmerRepo.UpdateAsync(farmer);
        }

        // Add reversal entry to ledger
        var currentBalance = await _ledgerRepo.GetFarmerBalanceAsync(c.FarmerId);
        await _ledgerRepo.AddAsync(new LedgerEntry
        {
            FarmerId        = c.FarmerId,
            TransactionDate = DateTime.Now,
            Description     = $"Milk Collection Cancelled — #{c.Id}",
            DebitAmount     = 0,
            CreditAmount    = c.TotalAmount,
            Balance         = currentBalance - c.TotalAmount,
            EntryType       = LedgerEntryType.Adjustment,
            ReferenceId     = c.Id
        });

        await _milkRepo.DeleteAsync(id);
        return NoContent();
    }

    private static decimal CalculateRate(decimal fat, decimal snf)
    {
        decimal rate = 25m + (fat - 3.5m) * 2.5m + (snf - 8.5m) * 1.5m;
        return Math.Round(Math.Max(rate, 18m), 2);
    }
}
