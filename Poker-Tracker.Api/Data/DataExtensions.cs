using Microsoft.EntityFrameworkCore;

namespace Poker_Tracker.Api.Data;

public static class DataExtensions
{
    public static void MigrateDb(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider
            .GetRequiredService<PokerTrackerContext>();
        dbContext.Database.Migrate();
    }

    public static void AddPokerTrackerDb(this WebApplicationBuilder builder)
    {
        var connString = builder.Configuration.GetConnectionString("PokerTracker");
        builder.Services.AddSqlite<PokerTrackerContext>(connString);
    }
}