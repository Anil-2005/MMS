using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MilkCollection.Core.Entities;
using MilkCollection.Infrastructure.Data;
using System.Security.Cryptography;
using System.Text;

namespace MilkCollection.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context) => _context = context;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (await _context.Users.AnyAsync(u => u.Username == req.Username))
            return BadRequest(new { message = "Username already exists." });

        if (await _context.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new { message = "Email already registered." });

        // Resolve farmer link if farmerCode provided
        int? farmerId = null;
        string role = _context.Users.Any() ? "Farmer" : "Admin"; // first user = Admin

        if (!string.IsNullOrWhiteSpace(req.FarmerCode))
        {
            var farmer = await _context.Farmers.FirstOrDefaultAsync(f => f.FarmerCode == req.FarmerCode);
            if (farmer == null)
                return BadRequest(new { message = "Farmer code not found. Please check and try again." });

            // Check if this farmer already has an account
            if (await _context.Users.AnyAsync(u => u.FarmerId == farmer.Id))
                return BadRequest(new { message = "An account already exists for this farmer code." });

            farmerId = farmer.Id;
            role = "Farmer";
        }

        var user = new User
        {
            Username     = req.Username,
            Email        = req.Email,
            PasswordHash = HashPassword(req.Password),
            Role         = role,
            FarmerId     = farmerId,
            CreatedAt    = DateTime.Now,
            IsActive     = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        HttpContext.Session.SetInt32("UserId", user.Id);
        HttpContext.Session.SetString("Username", user.Username);
        HttpContext.Session.SetString("Role", user.Role);
        if (farmerId.HasValue) HttpContext.Session.SetInt32("FarmerId", farmerId.Value);

        return Ok(new
        {
            message  = "Registration successful.",
            userId   = user.Id,
            username = user.Username,
            role     = user.Role,
            farmerId = user.FarmerId
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _context.Users
            .Include(u => u.Farmer)
            .FirstOrDefaultAsync(u => u.Username == req.Username && u.IsActive);

        if (user == null || !VerifyPassword(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid username or password." });

        HttpContext.Session.SetInt32("UserId", user.Id);
        HttpContext.Session.SetString("Username", user.Username);
        HttpContext.Session.SetString("Role", user.Role);
        if (user.FarmerId.HasValue) HttpContext.Session.SetInt32("FarmerId", user.FarmerId.Value);

        return Ok(new
        {
            message     = "Login successful.",
            userId      = user.Id,
            username    = user.Username,
            role        = user.Role,
            farmerId    = user.FarmerId,
            farmerName  = user.Farmer?.Name,
            farmerCode  = user.Farmer?.FarmerCode
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return Ok(new { message = "Logged out." });
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = HttpContext.Session.GetInt32("UserId");
        if (userId == null) return Unauthorized(new { message = "Not logged in." });

        return Ok(new
        {
            userId,
            username = HttpContext.Session.GetString("Username"),
            role     = HttpContext.Session.GetString("Role"),
            farmerId = HttpContext.Session.GetInt32("FarmerId")
        });
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "MMS_SALT_2024"));
        return Convert.ToBase64String(bytes);
    }

    private static bool VerifyPassword(string password, string hash)
        => HashPassword(password) == hash;
}

public class RegisterRequest
{
    public string Username   { get; set; } = string.Empty;
    public string Email      { get; set; } = string.Empty;
    public string Password   { get; set; } = string.Empty;
    public string? FarmerCode { get; set; } // optional — links to a Farmer
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
