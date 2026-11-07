namespace MilkCollection.Core.Entities;

public class Payment
{
    public int Id { get; set; }
    public int FarmerId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Remarks { get; set; }
    
    // Navigation properties
    public Farmer? Farmer { get; set; }
}

public enum PaymentMethod
{
    Cash = 1,
    BankTransfer = 2,
    Cheque = 3,
    UPI = 4
}