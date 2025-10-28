using Microsoft.AspNetCore.Mvc;
using RayMinder.Api.Data;
using RayMinder.Api.Models;

namespace RayMinder.Api.Controllers
{
    [ApiController]
    [Route("api/locations")]
    public class LocationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LocationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAllLocations()
        {
            var locations = _context.Locations.ToList();
            return Ok(locations);
        }

        [HttpPost]
        public IActionResult UpdateLocation([FromBody] Location location)
        {
            if (string.IsNullOrEmpty(location.Username))
                return BadRequest(new { message = "Username is required" });

            // Find existing location for the user
            var existing = _context.Locations.FirstOrDefault(l => l.Username == location.Username);

            if (existing != null)
            {
                existing.Latitude = location.Latitude;
                existing.Longitude = location.Longitude;
                existing.Timestamp = DateTime.UtcNow;
                _context.Locations.Update(existing);
            }
            else
            {
                location.Timestamp = DateTime.UtcNow;
                _context.Locations.Add(location);
            }

            _context.SaveChanges();

            return Ok(new { message = "Location updated successfully" });
        }
    }
}
