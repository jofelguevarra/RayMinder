var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:5007");

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// This will serve index.html automatically at http://localhost:5007/
app.UseDefaultFiles();   

// This enables serving static files from wwwroot folder
app.UseStaticFiles();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Optional: Disable HTTPS redirection since you are serving on http only
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
