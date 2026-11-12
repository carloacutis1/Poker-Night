using Microsoft.EntityFrameworkCore;
using Poker_Tracker.Api.Data;
using Poker_Tracker.Api.Dtos;
using Poker_Tracker.Api.Models;

namespace Poker_Tracker.Api.Endpoints;

public static class SessionsEndpoints
{
    const string GetSessionEndpointName = "GetSession";

    public static void MapSessionsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/sessions");

        // GET all sessions
        group.MapGet("/", async (PokerTrackerContext dbContext) 
        => await dbContext.Sessions
                          .Select(session => new SessionDto(
                            session.Id,
                            session.Location,
                            session.BuyIn,
                            session.AddOn,
                            session.CashOut,
                            session.Date
                          ))
                          .AsNoTracking()
                          .ToListAsync());


        // GET /sessions/1
        group.MapGet("/{id}", async (int id, PokerTrackerContext dbContext) =>
        {
            var session = await dbContext.Sessions.FindAsync(id);

            return session is null ? Results.NotFound() : Results.Ok(
                new SessionDto(
                    session.Id,
                    session.Location,
                    session.BuyIn,
                    session.AddOn,
                    session.CashOut,
                    session.Date
                )
            );
        })
        .WithName(GetSessionEndpointName);

        // POST /sessions
        group.MapPost("/", async (CreateSessionDto newSession, PokerTrackerContext dbcontext) =>
        {
            Session session = new()
            {
                Location = newSession.Location,
                BuyIn = newSession.BuyIn,
                AddOn = newSession.AddOn,
                CashOut = newSession.CashOut,
                Date = newSession.Date
            };

            dbcontext.Sessions.Add(session);
            await dbcontext.SaveChangesAsync();

            SessionDto SessionDto = new(
                session.Id,
                session.Location,
                session.BuyIn,
                session.AddOn,
                session.CashOut,
                session.Date
            );

            return Results.CreatedAtRoute(GetSessionEndpointName, new {id = SessionDto.Id}, SessionDto);
        });

        // PUT /games/1
        group.MapPut("/{id}", async (int id, 
                                    UpdateSessionDto updatedSession, 
                                    PokerTrackerContext dbContext) =>
        {
            var existingSession = await dbContext.Sessions.FindAsync(id);

            if (existingSession is null)
            {
                return Results.NotFound();
            }

            existingSession.Location = updatedSession.Location;
            existingSession.BuyIn = updatedSession.BuyIn;
            existingSession.AddOn = updatedSession.AddOn;
            existingSession.CashOut = updatedSession.CashOut;
            existingSession.Date = updatedSession.Date;

            await dbContext.SaveChangesAsync();

            return Results.NoContent();
        });

        // DELETE /sessions/1
        group.MapDelete("/{id}", async (int id, PokerTrackerContext dbContext) =>
        {
            await dbContext.Sessions
                           .Where(session => session.Id == id)
                           .ExecuteDeleteAsync();

            return Results.NoContent();
        });
    }
}