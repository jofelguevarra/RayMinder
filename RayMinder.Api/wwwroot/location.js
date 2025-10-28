// location.js

async function updateUserLocation(username) {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser 😞");
    return;
  }

  // Ask for permission and get location
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log("Location:", latitude, longitude);

      // Send location to backend
      try {
        const response = await fetch("http://localhost:5007/api/location/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,   // Will pass this dynamically
            latitude: latitude,
            longitude: longitude,
          }),
        });

        const data = await response.json();
        console.log("Location updated:", data);
      } catch (error) {
        console.error("Failed to update location:", error);
      }
    },
    (error) => {
      console.error("⚠️ Error getting location:", error);
      alert("Could not get your location. Please allow location access.");
    }
  );
}
