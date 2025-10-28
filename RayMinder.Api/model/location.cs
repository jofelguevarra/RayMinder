using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RayMinder.Api.Models
{
    public class Location
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? Username { get; set; }

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
