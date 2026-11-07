using Microsoft.AspNetCore.Mvc;
using MilkCollection.Core.Entities;
using MilkCollection.Core.Interfaces;

namespace MilkCollection.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FarmersController : ControllerBase
{
    private readonly IFarmerRepository _farmerRepository;

    public FarmersController(IFarmerRepository farmerRepository)
    {
        _farmerRepository = farmerRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Farmer>>> GetFarmers()
    {
        var farmers = await _farmerRepository.GetAllAsync();
        return Ok(farmers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Farmer>> GetFarmer(int id)
    {
        var farmer = await _farmerRepository.GetByIdAsync(id);
        if (farmer == null)
            return NotFound();

        return Ok(farmer);
    }

    [HttpGet("by-code/{code}")]
    public async Task<ActionResult<Farmer>> GetFarmerByCode(string code)
    {
        var farmer = await _farmerRepository.GetByCodeAsync(code);
        if (farmer == null)
            return NotFound();

        return Ok(farmer);
    }

    [HttpPost]
    public async Task<ActionResult<Farmer>> CreateFarmer(Farmer farmer)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existing = await _farmerRepository.GetByCodeAsync(farmer.FarmerCode);
        if (existing != null)
            return BadRequest(new { message = $"Farmer with code '{farmer.FarmerCode}' already exists." });

        farmer.RegistrationDate = DateTime.Now;
        var createdFarmer = await _farmerRepository.AddAsync(farmer);
        
        return CreatedAtAction(nameof(GetFarmer), new { id = createdFarmer.Id }, createdFarmer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFarmer(int id, Farmer farmer)
    {
        if (id != farmer.Id)
            return BadRequest();

        var existing = await _farmerRepository.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        var codeCheck = await _farmerRepository.GetByCodeAsync(farmer.FarmerCode);
        if (codeCheck != null && codeCheck.Id != id)
            return BadRequest(new { message = $"Farmer code '{farmer.FarmerCode}' is already in use by another farmer." });

        existing.FarmerCode = farmer.FarmerCode;
        existing.Name = farmer.Name;
        existing.PhoneNumber = farmer.PhoneNumber;
        existing.Address = farmer.Address;
        existing.IsActive = farmer.IsActive;

        await _farmerRepository.UpdateAsync(existing);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFarmer(int id)
    {
        var farmer = await _farmerRepository.GetByIdAsync(id);
        if (farmer == null)
            return NotFound();

        try
        {
            await _farmerRepository.DeleteAsync(id);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException)
        {
            // Farmer has historical collections/payments; soft-delete to preserve ledger integrity
            farmer.IsActive = false;
            await _farmerRepository.UpdateAsync(farmer);
        }

        return NoContent();
    }
}