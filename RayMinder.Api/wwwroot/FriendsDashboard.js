import { sendFriendNotification } from './friends.js';
import { bleConnectionInstance } from './BLEConnection.js';

console.log("friend-dashboard.js loaded");

const params = new URLSearchParams(window.location.search);
const friendUsername = params.get('username');
const friendNameEl = document.getElementById('friend-name');
const directionEl = document.getElementById('friend-direction');
const distanceEl = document.getElementById('friend-distance');
const remindBtn = document.getElementById('remindFriend');
const findBtn = document.getElementById('findFriend');
const statusEl = document.getElementById('status');

const LOCATION_API_URL = "http://localhost:5007/api/location";

friendNameEl.textContent = friendUsername || 'Friend';

// Get location
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

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

function getBearing(lat1, lon1, lat2, lon2) {
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const deltaLonRad = toRad(lon2 - lon1);
  const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);
  const bearingRad = Math.atan2(y, x);
  return (toDeg(bearingRad) + 360) % 360;
}

function distanceBetween(lat1, lon1, lat2, lon2) {
  // approximate Haversine distance in meters
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function updateDirectionDisplay() {
  try {
    const me = localStorage.getItem('username');
    if (!me || !friendUsername) return;

    const myLoc = await getLocation(me);
    const friendLoc = await getLocation(friendUsername);
    if (!myLoc || !friendLoc) {
      directionEl.textContent = 'Direction: unknown';
      distanceEl.textContent = 'Distance: unknown';
      return;
    }

    const bearing = getBearing(myLoc.latitude, myLoc.longitude, friendLoc.latitude, friendLoc.longitude);
    // rotate by device facing direction if available
    const rotation = bleConnectionInstance.facingDirection || 0;
    const adjusted = (bearing + rotation) % 360;

    // convert degrees to compass
    const compass = degToCompass(adjusted);

    directionEl.textContent = `Direction: ${compass} (${Math.round(adjusted)}°)`;
    const meters = Math.round(distanceBetween(myLoc.latitude, myLoc.longitude, friendLoc.latitude, friendLoc.longitude));
    distanceEl.textContent = `Distance: ${meters} m`;

  } catch (err) {
    console.error(err);
  }
}

function degToCompass(num) {
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return arr[(val % 16)];
}

// wire up buttons
remindBtn.addEventListener('click', async () => {
  statusEl.textContent = `Sending reminder to ${friendUsername}...`;
  const res = await sendFriendNotification(friendUsername);
  if (res === null) {
    statusEl.textContent = 'Reminder sent!';
    statusEl.style.color = 'green';
  } else {
    statusEl.textContent = 'Failed to send reminder';
    statusEl.style.color = 'red';
  }
});

// "Find friend" triggers the buzzer via same send function (hardware will buzz toward friend)
findBtn.addEventListener('click', async () => {
  statusEl.textContent = `Triggering buzz toward ${friendUsername}...`;
  const res = await sendFriendNotification(friendUsername);
  if (res === null) {
    statusEl.textContent = 'Buzz triggered!';
    statusEl.style.color = 'green';
  } else {
    statusEl.textContent = 'Could not trigger buzz';
    statusEl.style.color = 'red';
  }
});

// initial update + periodic refresh
updateDirectionDisplay();
setInterval(updateDirectionDisplay, 8000);
