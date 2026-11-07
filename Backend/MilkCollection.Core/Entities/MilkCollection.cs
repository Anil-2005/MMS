namespace MilkCollection.Core.Entities;

public class MilkCollection
{
    public int Id { get; set; }
    public int FarmerId { get; set; }
    public DateTime CollectionDate { get; set; }
    public TimeSpan CollectionTime { get; set; }
    public decimal Quantity { get; set; } // in liters
    public decimal FatPercentage { get; set; }
    public decimal SnfPercentage { get; set; } // Solid Not Fat
    public decimal RatePerLiter { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Remarks { get; set; }
    
    // Navigation properties
    public Farmer? Farmer { get; set; }
}