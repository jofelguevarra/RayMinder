import { bleConnectionInstance } from './BLEConnection.js';

console.log("friends.js loaded");

const API_URL = "http://localhost:5007/api/friends";
const LOCATION_API_URL = "http://localhost:5007/api/location";
const username = localStorage.getItem("username");

const messageDiv = document.getElementById("user-info");
const friendInput = document.getElementById("friend-username");
const friendsList = document.getElementById("friends-list");
const addBtn = document.getElementById("add-friend-btn");
const friendsStatus = document.getElementById("friends-status");

// Show small status messages
function showMessage(text, color = 'black') {
  if (friendsStatus) {
    friendsStatus.textContent = text;
    friendsStatus.style.color = color;
    setTimeout(() => { friendsStatus.textContent = ''; }, 3500);
  }
}

// Load all friends
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

    // Open friend dashboard in a separate page
    friendsList.querySelectorAll('.btn-open').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const friend = e.currentTarget.dataset.user;
        window.location.href = `friend-dashboard.html?username=${encodeURIComponent(friend)}`;
      });
    });

    // Remind a friend
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
    showMessage("Error loading your friends list", "red");
  }
}

// Add a new friend
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
    showMessage("Server connection error.", "red");
  }
});

// “Remind a Friend” FEATURE – triggered from the main button
document.getElementById('show-reminder-mode').addEventListener('click', async () => {
  const reminderSection = document.getElementById('reminder-section');
  const dashboard = document.getElementById('friend-dashboard');
  const list = document.getElementById('reminder-friends-list');
  
  reminderSection.style.display = 'block';
  dashboard.style.display = 'none';
  list.innerHTML = '<li>Loading friends...</li>';

  try {
    const response = await fetch(`${API_URL}/${username}`);
    const friends = await response.json();

    list.innerHTML = '';

    if (!friends || friends.length === 0) {
      list.innerHTML = '<li>No friends found.</li>';
      return;
    }

    friends.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f.friendUsername;
      li.style.cursor = 'pointer';
      li.style.padding = '6px';
      li.style.borderBottom = '1px solid #ddd';
      li.addEventListener('click', () => openFriendDashboard(f.friendUsername));
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading friends for reminder:", err);
    list.innerHTML = '<li>Error loading friends.</li>';
  }
});

// Open mini friend dashboard
function openFriendDashboard(friendUsername) {
  document.getElementById('reminder-section').style.display = 'none';
  const dashboard = document.getElementById('friend-dashboard');
  dashboard.style.display = 'block';
  document.getElementById('friend-name-display').textContent = friendUsername + "'s Dashboard";

  // Placeholder data (to be replaced later with real friend data)
  document.getElementById('friend-uv').textContent = "5";
  document.getElementById('friend-timer').textContent = "00:15:23";
  document.getElementById('friend-direction').textContent = "NE (45°)";
}

// Back to reminder list
document.getElementById('back-to-friends').addEventListener('click', () => {
  document.getElementById('friend-dashboard').style.display = 'none';
  document.getElementById('reminder-section').style.display = 'block';
});

// Location + Notification + Direction Calculation
async function sendFriendNotification(friendUsername) {
  try {
    const userLocation = await getLocation(username);
    const friendLocation = await getLocation(friendUsername);

    if (!userLocation) return new Error('missing user location');
    if (!friendLocation) return new Error('missing friend location');

    // Bearing and rotation
    let rotation = bleConnectionInstance.facingDirection || 0;
    let totalFacingDirection = getBearing(
      userLocation.latitude,
      userLocation.longitude,
      friendLocation.latitude,
      friendLocation.longitude
    );
    totalFacingDirection = (totalFacingDirection + rotation) % 360;

    // Which buzzer to activate
    let buzzer = getDirectionCode(totalFacingDirection);
    let message = String(buzzer);

    await bleConnectionInstance.sendMessage(message);
    console.log(`Sent direction ${totalFacingDirection}° (buzzer ${buzzer}) to ESP`);
    return null;
  } catch (err) {
    console.error('Error sending friend notification:', err);
    return err;
  }

  function getDirectionCode(degree) {
    const codes = [5, 2, 6, 3, 7, 0, 4, 1];
    const index = Math.floor(((degree + 22.5) % 360) / 45);
    return codes[index];
  }
}

function getBearing(lat1, lon1, lat2, lon2) {
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const deltaLonRad = toRad(lon2 - lon1);
  const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);
  const bearingRad = Math.atan2(y, x);
  return (toDeg(bearingRad) + 360) % 360;
}

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

async function getLocation(user) {
  try {
    const res = await fetch(LOCATION_API_URL + '/' + encodeURIComponent(user));
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    console.error('getLocation error:', err);
    return null;
  }
}

window.addEventListener("load", loadFriends);

export { sendFriendNotification, loadFriends };
