// location.js

// API base URL
const API_URL = "http://localhost:5007/api/location";

// Get the logged-in user's username from localStorage
const username = localStorage.getItem("username");

// Function to send location data to backend
async function sendLocationToServer(latitude, longitude) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        latitude: latitude,
        longitude: longitude,
        time: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("Failed to send location:", response.statusText);
    } else {
      console.log("Location sent successfully");
    }
  } catch (error) {
    console.error("Error sending location:", error);
  }
}

// Use the browser's Geolocation API
function trackUserLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

    alert("Requesting location permission...");
    
  // Watch position (updates as the user moves)
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("New location:", latitude, longitude);
      sendLocationToServer(latitude, longitude);
    },
    (error) => {
      console.error("Error getting location:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000, // reuse last position if within 10s
      timeout: 5000, // 5 seconds max wait
    }
  );
}

// Start tracking when page loads
window.addEventListener("load", () => {
  if (username) {
    trackUserLocation();
  } else {
    console.warn("No username found in localStorage — user might not be logged in.");
  }
});
