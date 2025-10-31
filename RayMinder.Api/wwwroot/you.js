import { bleConnectionInstance } from './BLEConnection.js';
import { sendFriendNotification } from './friends.js';

console.log("Current you.js loaded");

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing You page...");

  // --- Element references ---
  const uvValue = document.getElementById('uv-value');
  const timerText = document.getElementById('timer-text');
  const timerBar = document.getElementById('timer-bar');
  const reapplyBtn = document.getElementById('reapply-btn');
  const alertMsg = document.getElementById('alert-message');
  const friendsTab = document.getElementById('friendsTab');
  const spfSelect = document.getElementById('spfSelect');
  const skinSelect = document.getElementById('skinSelect');
  const logoutBtn = document.getElementById('logout-btn');
  const lastAppliedText = document.getElementById('last-applied');

  // --- Timer setup ---
  let timerDuration = 20 * 60;
  let timeRemaining = timerDuration;
  let timerInterval;
  let uvIndex = 5;

  let timeOfLastApplication = null;
  let timeToNextApplication = null;

  // Helper for time formatting
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Display UV
  function updateUVDisplay(index) {
    uvValue.textContent = index;
    const circle = document.getElementById('uv-circle');
    const brightness = Math.min(1, index / 10);
    circle.style.boxShadow = `0 0 ${30 + index * 2}px rgba(255, 235, 59, ${brightness})`;
  }

  // Adjust timer based on UV intensity
  function adjustTimerBasedOnUV(index) {
    if (index <= 3) timerDuration = 30 * 60;
    else if (index <= 6) timerDuration = 20 * 60;
    else if (index <= 9) timerDuration = 15 * 60;
    else timerDuration = 10 * 60;
  }

  // Timer logic
  function startTimer() {
    clearInterval(timerInterval);
    timeRemaining = timerDuration;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        triggerAlert();
      } else {
        timeRemaining--;
        updateTimerDisplay();
      }
    }, 1000);
  }

  // Update timer bar and display
  function updateTimerDisplay() {
    if (!timeRemaining || isNaN(timeRemaining)) {
      timerText.textContent = "00:00:00";
      timerBar.style.width = "100%";
      return;
    }

    timerText.textContent = formatTime(timeRemaining);

    const percentage = (timeRemaining / timerDuration) * 100;
    timerBar.style.width = `${percentage}%`;

    if (percentage <= 20) {
      timerBar.style.backgroundColor = '#f44336';
    } else if (percentage <= 50) {
      timerBar.style.backgroundColor = '#ff9800';
    } else {
      timerBar.style.backgroundColor = '#4caf50';
      timerText.style.color = '#fff';
    }
  }

  function updateLastAppliedDisplay(secondsAgo) {
    if (!lastAppliedText) return;

    let text = "";
    if (secondsAgo < 60) {
      text = `Applied ${secondsAgo}s ago`;
    } else if (secondsAgo < 3600) {
      const mins = Math.floor(secondsAgo / 60);
      text = `Applied ${mins} min${mins !== 1 ? 's' : ''} ago`;
    } else {
      const hours = Math.floor(secondsAgo / 3600);
      const mins = Math.floor((secondsAgo % 3600) / 60);
      text = `Applied ${hours}h ${mins}m ago`;
    }

    lastAppliedText.textContent = text;
  }

  // --- BLE Communication ---
  document.getElementById('connectBtn').addEventListener('click', async () => {
    await bleConnectionInstance.connectBLE();
  });

  // Handle incoming BLE messages
  bleConnectionInstance.onMessage((message) => {
    console.log("Received message: " + message);

    // Starting with 0 -> new UV index
    if (message[0] == '0' && message.length == 3) {
      // New UV index
      uvIndex = message[1] == '0' ? message[2] : message.substring(1);
      updateUVDisplay(uvIndex);
      adjustTimerBasedOnUV(uvIndex);
      console.log("New UV index:", uvIndex);

    } else if (message[0] == '1' && message.length <= 16) {
      // Time of last application
      timeOfLastApplication = parseInt(message.substring(1), 10);
      console.log("Time of last application:", timeOfLastApplication, "seconds ago");
      updateLastAppliedDisplay(timeOfLastApplication);

    } else if (message[0] == '2' && message.length <= 16) {
      // Time to next application
      timeToNextApplication = parseInt(message.substring(1), 10);
      console.log("Time to next application:", timeToNextApplication, "seconds");

      if (!isNaN(timeToNextApplication) && timeToNextApplication > 0) {
        console.log("Setting timer from ESP:", timeToNextApplication, "seconds");
        clearInterval(timerInterval);
        timerDuration = timeToNextApplication;
        timeRemaining = timerDuration;
        updateTimerDisplay();
        startTimer();
      }
    } else if (message[0] == '3' && message.length == 4) {
      // Facing direction
      let degreeFacing = parseInt(message.slice(1, 4));
      bleConnectionInstance.facingDirection = degreeFacing;
      console.log("Degree facing:", degreeFacing);
    }

    return message;
  });

  // Update "last applied" text every second
  setInterval(() => {
    if (timeOfLastApplication) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const secondsAgo = nowSeconds - parseInt(timeOfLastApplication, 10);
      updateLastAppliedDisplay(secondsAgo);
    }
  }, 1000);

  // When timer finishes
  async function triggerAlert() {
    alertMsg.textContent = "Time to reapply sunscreen!";
    alert("Time to reapply sunscreen!");
    timerBar.style.backgroundColor = '#f44336';
    timerBar.style.width = '0%';

    // 4-digit message:
    //  1: Stands for "reapply sunscreen"
    //   XX: 2 digit SPF (e.g. 05, 15, 50)
    //     X: Skin type (1-6)
    const spfValue = spfSelect.value.padStart(2, '0');
    const skinValue = skinSelect.value;
    const message = `1${spfValue}${skinValue}`;

    // Send a message to the ESP32
    console.log("Sending alert message to ESP", message);
    await bleConnectionInstance.sendMessage(message);
    await notifyFriendsToBuzz();
  }

  async function notifyFriendsToBuzz() {
    try {
      const username = localStorage.getItem("username");
      const API_URL = "http://localhost:5007/api/friends";
      const response = await fetch(`${API_URL}/${username}`);
      if (!response.ok) return;

      const friends = await response.json();
      for (const f of friends) {
        console.log(`Notifying ${f.friendUsername} to reapply`);
        await sendFriendNotification(f.friendUsername);
      }
    } catch (err) {
      console.error("Error notifying friends:", err);
    }
  }

  // I reapplied button
  reapplyBtn.addEventListener('click', async () => {
    alertMsg.textContent = '';
    clearInterval(timerInterval);
    timeRemaining = timerDuration;
    updateTimerDisplay();
    startTimer();

    const spfValue = spfSelect.value.padStart(2, '0');
    const skinValue = skinSelect.value;
    const message = `1${spfValue}${skinValue}`;
    console.log("Manual reapply message:", message);
    await bleConnectionInstance.sendMessage(message);
  });

  // Safe redirect to friends page
  if (friendsTab) {
    friendsTab.addEventListener('click', (event) => {
      event.preventDefault();
      console.log("Navigating to friends.html");
      window.alert = () => {}; // disables “coming soon” alerts if any
      window.location.href = "friends.html";
    });
  }

  // --- Start processes ---
  startTimer();
});
