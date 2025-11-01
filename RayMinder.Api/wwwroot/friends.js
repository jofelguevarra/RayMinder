import { bleConnectionInstance } from './BLEConnection.js';
console.log("friends.js loaded");

const API_URL = "http://localhost:5007/api/friends";
const username = localStorage.getItem("username");

// UI Elements
const addFriendSection = document.getElementById("add-friend-section");
const friendsSection = document.getElementById("friends-section");
const menuSection = document.getElementById("menu-section");
const friendsList = document.getElementById("friends-list");
const statusMsg = document.getElementById("friends-status");
const listStatus = document.getElementById("list-status");
const friendInput = document.getElementById("friend-username");
const addBtn = document.getElementById("add-friend-btn");

// Menu buttons
const btnShowAdd = document.getElementById("btn-show-add");
const btnShowList = document.getElementById("btn-show-list");
const btnBackMenu = document.getElementById("btn-back-menu");
const btnBackToMenu = document.getElementById("btn-back-to-menu");

// Show/hide sections
btnShowAdd.addEventListener("click", () => {
  menuSection.style.display = "none";
  friendsSection.style.display = "none";
  addFriendSection.style.display = "block";
});

btnShowList.addEventListener("click", async () => {
  menuSection.style.display = "none";
  addFriendSection.style.display = "none";
  friendsSection.style.display = "block";
  await loadFriends();
});

btnBackMenu.addEventListener("click", () => {
  addFriendSection.style.display = "none";
  friendsSection.style.display = "none";
  menuSection.style.display = "block";
});

btnBackToMenu.addEventListener("click", () => {
  addFriendSection.style.display = "none";
  menuSection.style.display = "block";
});

// Helper for messages
function showMessage(target, text, color = 'black') {
  if (target) {
    target.textContent = text;
    target.style.color = color;
    setTimeout(() => { target.textContent = ''; }, 3000);
  }
}

// Load friends list
async function loadFriends() {
  try {
    if (!username) {
      showMessage(listStatus, "Not logged in.", "red");
      return;
    }

    const response = await fetch(`${API_URL}/${encodeURIComponent(username)}`);
    if (!response.ok) {
      showMessage(listStatus, "Failed to load friends.", "red");
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

    friendsList.querySelectorAll('.btn-open').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const friend = e.currentTarget.dataset.user;
        window.location.href = `friend-dashboard.html?username=${encodeURIComponent(friend)}`;
      });
    });

    friendsList.querySelectorAll('.btn-remind').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const friend = e.currentTarget.dataset.user;
        showMessage(listStatus, `Sending reminder to ${friend}...`, 'orange');
        const res = await sendFriendNotification(friend);
        if (res === null) {
          showMessage(listStatus, `Reminder sent to ${friend}.`, 'green');
        } else {
          showMessage(listStatus, `Failed to remind ${friend}.`, 'red');
          console.error(res);
        }
      });
    });

  } catch (err) {
    console.error("Error loading friends:", err);
    showMessage(listStatus, "Error loading friends list", "red");
  }
}

// Add a friend 
addBtn.addEventListener("click", async () => {
  const friendUsername = friendInput.value.trim();
  if (!friendUsername) {
    showMessage(statusMsg, "Please enter a friend's username.", "red");
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
      showMessage(statusMsg, result.message || "Friend added!", "green");
      friendInput.value = "";
    } else {
      showMessage(statusMsg, result.message || "Failed to add friend.", "red");
    }
  } catch (err) {
    console.error("Error adding friend:", err);
    showMessage(statusMsg, "Server connection error.", "red");
  }
});

// Friend Notification
async function sendFriendNotification(friendUsername) {
  try {
    const userLocation = await getLocation(username);
    const friendLocation = await getLocation(friendUsername);

    if (!userLocation || !friendLocation) {
      return new Error("Missing location data");
    }

    const rotation = bleConnectionInstance.facingDirection || 0;
    let totalFacingDirection = getBearing(
      userLocation.latitude,
      userLocation.longitude,
      friendLocation.latitude,
      friendLocation.longitude
    );
    totalFacingDirection = (totalFacingDirection + rotation) % 360;

    let buzzer = getDirectionCode(totalFacingDirection);
    let message = String(buzzer);
    await bleConnectionInstance.sendMessage(message);
    return null;
  } catch (err) {
    console.error("Error sending friend notification:", err);
    return err;
  }
}

function getDirectionCode(degree) {
  const codes = [5, 2, 6, 3, 7, 0, 4, 1];
  const index = Math.floor(((degree + 22.5) % 360) / 45);
  return codes[index];
}

function getBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const deltaLonRad = toRad(lon2 - lon1);

  const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);
  const bearingRad = Math.atan2(y, x);
  return (toDeg(bearingRad) + 360) % 360;
}

const LOCATION_API_URL = "http://localhost:5007/api/location";
async function getLocation(user) {
  try {
    const res = await fetch(LOCATION_API_URL + '/' + encodeURIComponent(user));
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    console.error("getLocation error:", err);
    return null;
  }
}