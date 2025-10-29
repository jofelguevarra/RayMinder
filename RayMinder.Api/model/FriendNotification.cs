namespace RayMinder.Api.Models
{
    public class FriendNotification
    {
        public int Id { get; set; }
        public string ReceiverUsername { get; set; } = string.Empty; // the one being added
        public string SenderUsername { get; set; } = string.Empty;   // the one who added
        public bool IsRead { get; set; } = false;                    // to track if seen
    }
}
