namespace MilkCollection.Core.Entities;

public class RateChart
{
    public int Id { get; set; }
    public decimal MinFatPercentage { get; set; }
    public decimal MaxFatPercentage { get; set; }
    public decimal MinSnfPercentage { get; set; }
    public decimal MaxSnfPercentage { get; set; }
    public decimal RatePerLiter { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; } = true;
}