using Microsoft.AspNetCore.Mvc;
using RayMinder.Api.Models;
using RayMinder.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace RayMinder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FriendsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FriendsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/friends/{username}
        [HttpGet("{username}")]
        public IActionResult GetFriends(string username)
        {
            var friends = _context.Friends
                .Where(f => f.Username == username)
                .Select(f => new { friendUsername = f.FriendUsername })
                .ToList();

            return Ok(friends);
        }

        // POST: api/friends
        [HttpPost]
        public IActionResult AddFriend([FromBody] Friend friend)
        {
            if (friend == null || string.IsNullOrEmpty(friend.Username) || string.IsNullOrEmpty(friend.FriendUsername))
            {
                return BadRequest(new { message = "Invalid data." });
            }

            if (friend.Username == friend.FriendUsername)
            {
                return BadRequest(new { message = "You cannot add yourself." });
            }

            // Prevent duplicates (both directions)
            var exists = _context.Friends.Any(f =>
                (f.Username == friend.Username && f.FriendUsername == friend.FriendUsername) ||
                (f.Username == friend.FriendUsername && f.FriendUsername == friend.Username));

            if (exists)
            {
                return Conflict(new { message = "You are already friends." });
            }

            // Add friendship both ways
            var friend1 = new Friend { Username = friend.Username, FriendUsername = friend.FriendUsername };
            var friend2 = new Friend { Username = friend.FriendUsername, FriendUsername = friend.Username };

            _context.Friends.Add(friend1);
            _context.Friends.Add(friend2);

            // Create a notification for the friend being added
            var notification = new FriendNotification
            {
                Username = friend.FriendUsername,  // receiver
                Message = $"{friend.Username} added you as a friend!",
                IsRead = false
            };

            _context.FriendNotifications.Add(notification);
            _context.SaveChanges();

            return Ok(new { message = "Friend added successfully and notification sent!" });
        }

        // GET: api/friends/notifications/{username}
        [HttpGet("notifications/{username}")]
        public IActionResult GetNotifications(string username)
        {
            var notifications = _context.FriendNotifications
                .Where(n => n.Username == username)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    n.Id,
                    n.Message,
                    n.IsRead,
                    n.CreatedAt
                })
                .ToList();

            return Ok(notifications);
        }

        // Optional: mark notification as read
        [HttpPost("notifications/read/{id}")]
        public IActionResult MarkNotificationAsRead(int id)
        {
            var notification = _context.FriendNotifications.FirstOrDefault(n => n.Id == id);
            if (notification == null)
                return NotFound(new { message = "Notification not found." });

            notification.IsRead = true;
            _context.SaveChanges();

            return Ok(new { message = "Notification marked as read." });
        }
    }
}
