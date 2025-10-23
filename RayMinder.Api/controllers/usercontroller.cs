using Microsoft.AspNetCore.Mvc;

namespace RayMinder.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // For testing purposes: accept any username/password
            if (!string.IsNullOrEmpty(request.Username) && !string.IsNullOrEmpty(request.Password))
            {
                return Ok(new { message = "Login successful" });
            }
            return Unauthorized(new { message = "Invalid username or password" });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (!string.IsNullOrEmpty(request.Username) && !string.IsNullOrEmpty(request.Password))
            {
                // Here you would typically save the user info in the database
                return Ok(new { message = $"User '{request.Username}' registered successfully" });
            }
            return BadRequest(new { message = "Username and password are required" });
        }
    }

    public record LoginRequest(string Username, string Password);
    public record RegisterRequest(string Username, string Password);
}
