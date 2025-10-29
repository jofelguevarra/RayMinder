// RayMinder.Api/Models/FriendNotification.cs
using System;

namespace RayMinder.Api.Models
{
    public class FriendNotification
    {
        public int Id { get; set; }                // primary key
        public string Username { get; set; }       // who receives the notification
        public string Message { get; set; }        // text of the notification
        public bool IsRead { get; set; } = false;  // read/unread flag
        public DateTime Time { get; set; } = DateTime.UtcNow; // when it was created
    }
}
