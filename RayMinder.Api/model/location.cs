using System.ComponentModel.DataAnnotations;

namespace RayMinder.Api.Models
{
    public class Location
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public DateTime Time { get; set; } = DateTime.UtcNow;
    }
}
