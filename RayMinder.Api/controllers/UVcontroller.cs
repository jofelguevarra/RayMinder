using Microsoft.AspNetCore.Mvc;

namespace RayMinder.Api.Controllers
{
    [ApiController]
    [Route("api/uv")]
    public class UVController : ControllerBase
    {
        private static readonly Random _random = new Random();

        [HttpGet("current")]
        public IActionResult GetCurrentUV()
        {
            // STEP 1: mock data (for now)
            int mockUV = _random.Next(1, 11); // range 1–10
            var result = new { uvIndex = mockUV };

            // STEP 2 (later): replace mockUV with real sensor input
            // e.g. int uvValue = ReadFromSensor(); or data from microcontroller

            return Ok(result);
        }
    }
}
