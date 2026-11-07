namespace MilkCollection.Core.Entities;

public class Farmer
{
    public int Id { get; set; }
    public string FarmerCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateTime RegistrationDate { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal AccountBalance { get; set; }
    
    // Navigation properties
    public ICollection<MilkCollection> MilkCollections { get; set; } = new List<MilkCollection>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<LedgerEntry> LedgerEntries { get; set; } = new List<LedgerEntry>();
}