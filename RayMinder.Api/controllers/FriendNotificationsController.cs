using Microsoft.AspNetCore.Mvc;
using RayMinder.Api.Models;
using RayMinder.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace RayMinder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FriendNotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FriendNotificationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/friendnotifications/{username}
        // Fetch all notifications for a user
        [HttpGet("{username}")]
        public IActionResult GetNotifications(string username)
        {
            var notifications = _context.FriendNotifications
                .Where(n => n.Username == username)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new {
                    n.Id,
                    n.Message,
                    n.IsRead,
                    n.CreatedAt
                })
                .ToList();

            return Ok(notifications);
        }

        // PUT: api/friendnotifications/markread/{id}
        // Mark a notification as read
        [HttpPut("markread/{id}")]
        public IActionResult MarkAsRead(int id)
        {
            var notification = _context.FriendNotifications.Find(id);
            if (notification == null)
                return NotFound(new { message = "Notification not found." });

            notification.IsRead = true;
            _context.SaveChanges();

            return Ok(new { message = "Notification marked as read." });
        }

        // PUT: api/friendnotifications/markallread/{username}
        // Mark all notifications for a user as read
        [HttpPut("markallread/{username}")]
        public IActionResult MarkAllAsRead(string username)
        {
            var userNotifications = _context.FriendNotifications
                .Where(n => n.Username == username && !n.IsRead)
                .ToList();

            if (!userNotifications.Any())
                return Ok(new { message = "No unread notifications." });

            foreach (var n in userNotifications)
                n.IsRead = true;

            _context.SaveChanges();
            return Ok(new { message = "All notifications marked as read." });
        }
    }
}
