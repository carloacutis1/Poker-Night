using System.ComponentModel.DataAnnotations;

namespace Poker_Tracker.Api.Dtos;

public record CreateSessionDto(
    [Required][StringLength(50)] string Location,
    [Required][Range(0, double.PositiveInfinity)] decimal BuyIn,
    [Required][Range(0, double.PositiveInfinity)] decimal AddOn,
    [Required][Range(0, double.PositiveInfinity)] decimal CashOut,
    [Required] DateOnly Date
);