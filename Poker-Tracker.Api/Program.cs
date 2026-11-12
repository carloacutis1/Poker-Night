using Poker_Tracker.Api.Data;
using Poker_Tracker.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidation();
builder.AddPokerTrackerDb();

var app = builder.Build();

app.MapSessionsEndpoints();

app.MigrateDb();

app.Run();
