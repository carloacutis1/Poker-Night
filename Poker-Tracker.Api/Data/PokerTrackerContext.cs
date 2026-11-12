using Microsoft.EntityFrameworkCore;
using Poker_Tracker.Api.Models;

namespace Poker_Tracker.Api.Data;

public class PokerTrackerContext(DbContextOptions<PokerTrackerContext> options) 
    : DbContext(options)
{
    public DbSet<Session> Sessions => Set<Session>();
}