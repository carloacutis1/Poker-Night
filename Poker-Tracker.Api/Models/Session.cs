namespace Poker_Tracker.Api.Models;

public class Session
{
    public int Id { get; set; }
    public string Location { get; set; }
    public decimal BuyIn { get; set; }
    public decimal AddOn { get; set; }
    public decimal CashOut { get; set; }
    public DateOnly Date { get; set; }
}