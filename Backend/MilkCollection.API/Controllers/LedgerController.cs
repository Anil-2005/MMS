using Microsoft.AspNetCore.Mvc;
using MilkCollection.Core.Interfaces;

namespace MilkCollection.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LedgerController : ControllerBase
{
    private readonly ILedgerRepository _ledgerRepo;

    public LedgerController(ILedgerRepository ledgerRepo)
    {
        _ledgerRepo = ledgerRepo;
    }

    [HttpGet("farmer/{farmerId}")]
    public async Task<IActionResult> GetByFarmer(int farmerId)
        => Ok(await _ledgerRepo.GetByFarmerIdAsync(farmerId));

    [HttpGet("balance/{farmerId}")]
    public async Task<IActionResult> GetBalance(int farmerId)
        => Ok(new { balance = await _ledgerRepo.GetFarmerBalanceAsync(farmerId) });
}
