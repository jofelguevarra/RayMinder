import { bleConnectionInstance } from './BLEConnection.js';

console.log("friends.js loaded");

const API_URL = "http://localhost:5007/api/friends";
const username = localStorage.getItem("username");

const messageDiv = document.getElementById("user-info");
const friendInput = document.getElementById("friend-username");
const friendsList = document.getElementById("friends-list");
const addBtn = document.getElementById("add-friend-btn");
const friendsStatus = document.getElementById("friends-status");

// Helper to show status messages on the page
function showMessage(text, color = 'black') {
  if (friendsStatus) {
    friendsStatus.textContent = text;
    friendsStatus.style.color = color;
    setTimeout(() => { friendsStatus.textContent = ''; }, 3500);
  }
}

// Load friends list from API
async function loadFriends() {
  try {
    if (!username) {
      showMessage("Not logged in.", "red");
      return;
    }
    const response = await fetch(`${API_URL}/${encodeURIComponent(username)}`);
    if (!response.ok) {
      showMessage("Failed to load friends.", "red");
      return;
    }

    const friends = await response.json();
    friendsList.innerHTML = "";

    if (!friends || friends.length === 0) {
      friendsList.innerHTML = "<li>No friends yet.</li>";
      return;
    }

    friends.forEach(f => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="friend-name">${f.friendUsername}</span>
        <span class="friend-actions">
          <button class="btn-open" data-user="${f.friendUsername}">Open</button>
          <button class="btn-remind" data-user="${f.friendUsername}">Remind</button>
        </span>
      `;
      friendsList.appendChild(li);
    });

    // attach event listeners (delegation)
    friendsList.querySelectorAll('.btn-open').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const friend = e.currentTarget.dataset.user;
        // open friend-dashboard with query param
        window.location.href = `friend-dashboard.html?username=${encodeURIComponent(friend)}`;
      });
    });

    friendsList.querySelectorAll('.btn-remind').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const friend = e.currentTarget.dataset.user;
        showMessage(`Sending reminder to ${friend}...`, 'orange');
        const res = await sendFriendNotification(friend);
        if (res === null) {
          showMessage(`Reminder sent to ${friend}.`, 'green');
        } else {
          showMessage(`Failed to remind ${friend}.`, 'red');
          console.error(res);
        }
      });
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

// TEST button
document.getElementById('testLocation').addEventListener('click', async () => {
  let friend = "testuser"; // TODO: Replace with actual friend username if desired
  await sendFriendNotification(friend);
});

// Send friend notification
async function sendFriendNotification(friendUsername) {
  try {
    // Get location of user + friend
    const userLocation = await getLocation(username);
    const friendLocation = await getLocation(friendUsername);

    if (!userLocation) {
      console.error(`No location found for current user '${username}'`);
      return new Error('missing user location');
    }

    if (!friendLocation) {
      console.error(`No location found for friend '${friendUsername}'`);
      return new Error('missing friend location');
    }

    // Get Bearing / Degree to the friend and rotate it by the RayMinder rotation
    let rotation = bleConnectionInstance.facingDirection || 0;
    let totalFacingDirection = getBearing(userLocation.latitude, userLocation.longitude, friendLocation.latitude, friendLocation.longitude);
    totalFacingDirection = (totalFacingDirection + rotation) % 360; // Rotate to fit the facing direction

    // Get buzzer(s) that should go off
    let buzzer = getDirectionCode(totalFacingDirection);
    let message = String(buzzer); // the hardware expects a short numeric code

    // Send message to ESP
    await bleConnectionInstance.sendMessage(message);

    return null; // null indicates success
  } catch (err) {
    console.error('Error sending friend notification:', err);
    return err;
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
  return rad * 180 / Math.PI;
}

const LOCATION_API_URL = "http://localhost:5007/api/location";

// Get location of a user from database
async function getLocation(user) {
  try {
    const res = await fetch(LOCATION_API_URL + '/' + encodeURIComponent(user));
    if (res.ok) {
      let userLocation = await res.json();
      console.log("Fetched location for", user);
      return userLocation;
    }
    console.warn(`Unexpected response fetching location for ${user}:`, res.status);
    return null;
  } catch (err) {
    console.error('getLocation error:', err);
    return null;
  }
}

window.addEventListener("load", loadFriends);

export { sendFriendNotification, loadFriends };
