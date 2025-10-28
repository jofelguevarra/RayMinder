using Microsoft.AspNetCore.Mvc;
using RayMinder.Api.Data;
using RayMinder.Api.Models;

namespace RayMinder.Api.Controllers
{
    [ApiController]
    [Route("api/location")]
    public class LocationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LocationController(AppDbContext context)
        {
            _context = context;
        }

        // Save or update a user's location
        [HttpPost("update")]
        public IActionResult UpdateLocation([FromBody] Location request)
        {
            if (string.IsNullOrEmpty(request.Username))
                return BadRequest(new { message = "Username is required" });

            var userLocation = _context.Locations.FirstOrDefault(l => l.Username == request.Username);

            if (userLocation == null)
            {
                _context.Locations.Add(request);
            }
            else
            {
                userLocation.Latitude = request.Latitude;
                userLocation.Longitude = request.Longitude;
                userLocation.Time = DateTime.UtcNow;
            }

            _context.SaveChanges();
            return Ok(new { message = "Location updated successfully" });
        }

        // Get all users' locations
        [HttpGet]
        public IActionResult GetLocations()
        {
            var locations = _context.Locations.ToList();
            return Ok(locations);
        }
    }
}
