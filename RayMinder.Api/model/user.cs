using System.ComponentModel.DataAnnotations;

namespace RayMinder.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Email { get; set; }
    }
}
