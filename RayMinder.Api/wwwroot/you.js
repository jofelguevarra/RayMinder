import { bleConnectionInstance } from './BLEConnection.js';

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

  // --- Timer setup ---
  let timerDuration = 20 * 60;
  let timeRemaining = timerDuration;
  let timerInterval;
  let uvIndex = 5;

  let timeOfLastApplication = null;
  let timeToNextApplication = null;

  function updateUVDisplay(index) {
    uvValue.textContent = index;
    const circle = document.getElementById('uv-circle');
    const brightness = Math.min(1, index / 10);
    circle.style.boxShadow = `0 0 ${30 + index * 2}px rgba(255, 235, 59, ${brightness})`;
  }

  function adjustTimerBasedOnUV(index) {
    if (index <= 3) timerDuration = 30 * 60;
    else if (index <= 6) timerDuration = 20 * 60;
    else if (index <= 9) timerDuration = 15 * 60;
    else timerDuration = 10 * 60;
  }

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

  function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerText.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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

  document.getElementById('connectBtn').addEventListener('click', async () => {
    await bleConnectionInstance.connectBLE();
  });

  bleConnectionInstance.onMessage((message) => {
    console.log("Received message: " + message);

    // Starting with 0 -> new UV index
    // 0XX
    if (message[0] == '0' && message.length == 3) {
      if (message[1] == '0')
        uvIndex = message[2];
      else
        uvIndex = message.substring(1, message.length);

      updateUVDisplay(uvIndex);
      adjustTimerBasedOnUV(uvIndex);

      console.log("New UV index: " + uvIndex);

      // Starting with 1 -> time of application
      // 1XXXXX... -> up to 15 characters for time
    } else if (message[0] == '1' && message.length <= 16) {
      timeOfLastApplication = message.substring(1, message.length);

      console.log("Time of application: " + timeOfLastApplication);

      // Starting with 2 -> time till next application
      // 2XXXXX... -> up to 15 characters for time
    } else if (message[0] == '2' && message.length <= 16) {
      timeToNextApplication = message.substring(1, message.length);

      console.log("Time to next application: " + timeToNextApplication);

      // TODO: Update timer based on this value + calculate percentage for timer bar

      // Starting with 3 -> Facing direction
      // 3XXX
    } else if (message[0] == '3' && message.length == 4) {
      let degreeFacing = parseInt(message.slice(1, 4));
      bleConnectionInstance.facingDirection = degreeFacing;
      console.log("Degree facing: " + degreeFacing);
    }

    return message;
  });

  async function triggerAlert() {
    alertMsg.textContent = "Time to reapply sunscreen!";
    alert("Time to reapply sunscreen!");
    timerBar.style.backgroundColor = '#f44336';
    timerBar.style.width = '0%';

    // 4-digit message:
    //  1: Stands for "reapply sunscreen"
    //   XX: 2 digit SPF (e.g. 05, 15, 50)
    //     X: Skin type (1-6)
    let message = "test"; // TODO: Add correct message

    // Send a message to the ESP32
    await bleConnectionInstance.sendMessage(message);
  }

  reapplyBtn.addEventListener('click', () => {
    alertMsg.textContent = '';
    // fetchUV();
    startTimer();
    triggerAlert();
  });

  // --- Safe redirect to friends page ---
  if (friendsTab) {
    friendsTab.addEventListener('click', (event) => {
      event.preventDefault();
      console.log("Navigating to friends.html");
      window.alert = () => {}; // disables “coming soon” alerts if any
      window.location.href = "friends.html";
    });
  }

  // --- Start processes ---
  // fetchUV();
  startTimer();
  // setInterval(fetchUV, 30000);
});
