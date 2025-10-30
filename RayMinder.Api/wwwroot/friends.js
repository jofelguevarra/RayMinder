import { bleConnectionInstance } from './BLEConnection.js';

console.log("friends.js loaded");

const API_URL = "http://localhost:5007/api/friends";
const username = localStorage.getItem("username");

const messageDiv = document.getElementById("user-info");
const friendInput = document.getElementById("friend-username");
const friendsList = document.getElementById("friends-list");
const addBtn = document.getElementById("add-friend-btn");

// Load friends list from API
async function loadFriends() {
  try {
    const response = await fetch(`${API_URL}/${username}`);
    const friends = await response.json();
    friendsList.innerHTML = "";

    if (friends.length === 0) {
      friendsList.innerHTML = "<li>No friends yet.</li>";
      return;
    }

    friends.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.friendUsername;
      friendsList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading friends:", err);
    showMessage ("Error loading your friends list", "red");
  }
}

// Add a friend
addBtn.addEventListener("click", async () => {
  const friendUsername = friendInput.value.trim();
  if (!friendUsername) {
    showMessage("Please enter a friend's username.", "red");
    return;
  }

  if (!username) {
    showMessage("You must be logged in to add friends.", "red");
    return;
  }

  const data = { username, friendUsername };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      showMessage(result.message || "Friend added successfully!", "green");
      friendInput.value = "";
      await loadFriends();
    } else {
      showMessage(result.message || "Failed to add friend.", "red");
    }
  } catch (err) {
    console.error("Error adding friend:", err);
    showMessage("⚠️ Server connection error.", "red");
  }
});

// Show status message
function showMessage(text, color) {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
  messageDiv.style.fontWeight = "bold";
  messageDiv.style.marginTop = "8px";
}

// Notify friends 
document.getElementById('testLocation').addEventListener('click', async () => {
  let friend = "testuser"; // TODO: Replace with actual friend username
  await sendFriendNotification(friend);
});

// TODO: Call this function when a friend has to reapply sunscreen
// Send Message to ESP32 with the buzzer(s) that should go off in the direction of the friend that needs to reapply sunscreen


async function sendFriendNotification(friendUsername) {
  try {
    // Get location of user + friend
    const userLocation = await getLocation(username);
    const friendLocation = await getLocation(friendUsername);

    if (!userLocation) {
      console.error(`No location found for current user '${username}'`);
      return null;
    }

    if (!friendLocation) {
      console.error(`No location found for friend '${friendUsername}'`);
      return null;
    }

    // Get Bearing / Degree to the friend and rotate it by the RayMinder rotation
    let rotation = bleConnectionInstance.facingDirection;
    let totalFacingDirection = getBearing(userLocation.latitude, userLocation.longitude, friendLocation.latitude, friendLocation.longitude);
    totalFacingDirection = (totalFacingDirection + rotation) % 360; // Rotate to fit the facing direction

    // Get buzzer(s) that should go off
    let buzzer = getDirectionCode(totalFacingDirection);
    let message = buzzer;

    // Send message to ESP
    await bleConnectionInstance.sendMessage(message);

    return null;
  } catch (err) {
    console.error('Error sending friend notification:', err);
    return null;
  }

  // Get buzzer code for direction (each buzzer or buzzer combination has 45 degrees)
  function getDirectionCode(degree) {
    const codes = [5, 2, 6, 3, 7, 0, 4, 1];
    const index = Math.floor(((degree + 22.5) % 360) / 45);
    return codes[index];
  }
}

// Get "Bearing" / facing direction from one location to another
function getBearing(lat1, lon1, lat2, lon2) {
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const deltaLonRad = toRad(lon2 - lon1);

  const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);
  const bearingRad = Math.atan2(y, x);
  return (toDeg(bearingRad) + 360) % 360;
}

function toRad(deg) {
 return deg * Math.PI / 180;
}

function toDeg(rad) {
  rad * 180 / Math.PI;
}


const LOCATION_API_URL = "http://localhost:5007/api/location";

// Get location of a user from database
async function getLocation(user) {
  try {
    // Try single-user endpoint
    const res = await fetch(LOCATION_API_URL + '/' + encodeURIComponent(user));
    if (res.ok) {
      let userLocation = await res.json();
      console.log("Fetched location for", user);
      return userLocation;
    }

    // Other non-ok responses
    console.warn(`Unexpected response fetching location for ${user}:`, res.status);
    return null;
  } catch (err) {
    console.error('getLocation error:', err);
    return null;
  }
}

window.addEventListener("load", loadFriends);