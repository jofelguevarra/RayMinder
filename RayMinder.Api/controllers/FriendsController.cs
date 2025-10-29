using Microsoft.AspNetCore.Mvc;
using RayMinder.Api.Models;
using RayMinder.Api.Data;
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
                .Select(f => f.FriendUsername)
                .ToList();

            return Ok(friends);
        }

        // POST: api/friends
        [HttpPost]
        public IActionResult AddFriend([FromBody] Friend friend)
        {
            if (friend == null || string.IsNullOrEmpty(friend.Username) || string.IsNullOrEmpty(friend.FriendUsername))
            {
                return BadRequest("Invalid data.");
            }

            // Prevent duplicates
            var exists = _context.Friends.Any(f => 
                f.Username == friend.Username && f.FriendUsername == friend.FriendUsername);
            if (exists)
            {
                return Conflict("Friend already added.");
            }

            _context.Friends.Add(friend);
            _context.SaveChanges();

            return Ok("Friend added successfully!");
        }
    }
}
