namespace MilkCollection.Core.Entities;

public class LedgerEntry
{
    public int Id { get; set; }
    public int FarmerId { get; set; }
    public DateTime TransactionDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
    public decimal Balance { get; set; }
    public LedgerEntryType EntryType { get; set; }
    public int? ReferenceId { get; set; } // Reference to MilkCollection or Payment
    
    // Navigation properties
    public Farmer? Farmer { get; set; }
}

public enum LedgerEntryType
{
    MilkCollection = 1,
    Payment = 2,
    Adjustment = 3,
    Deduction = 4
}