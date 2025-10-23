using Microsoft.AspNetCore.Mvc;
using RayMinder.Api.Helpers;
using RayMinder.Api.Models;

namespace RayMinder.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        // Simple in-memory list (you can later replace with database)
        private static readonly List<User> Users = new();

        [HttpPost("register")]
        public IActionResult Register([FromBody] User user)
        {
            if (Users.Any(u => u.Username == user.Username))
                return BadRequest("Username already exists.");

            var hashedPassword = PasswordHelper.HashPassword(user.PasswordHash);
            Users.Add(new User { Username = user.Username, PasswordHash = hashedPassword });

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] User user)
        {
            var hashedPassword = PasswordHelper.HashPassword(user.PasswordHash);
            var existingUser = Users.FirstOrDefault(u =>
                u.Username == user.Username && u.PasswordHash == hashedPassword);

            if (existingUser == null)
                return Unauthorized("Invalid username or password.");

            return Ok("Login successful.");
        }
    }
}
