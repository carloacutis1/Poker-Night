namespace Poker_Tracker.Api.Dtos;

// A DTO is a contract between the client and 
// server since it represents a shared argument
// about how data will be transferred and used.

public record SessionDto(
    int Id,
    string Location,
    decimal BuyIn,
    decimal AddOn,
    decimal CashOut,
    DateOnly Date
);

