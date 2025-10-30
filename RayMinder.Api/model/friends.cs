namespace RayMinder.Api.Models
{
    public class Friend
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;       // User
        public string FriendUsername { get; set; } = string.Empty; // Friend
    }
}
