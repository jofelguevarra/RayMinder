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

  // --- Fetch UV Index ---
  async function fetchUV() {
    try {
      const response = await fetch('http://localhost:5007/api/uv/current');
      const data = await response.json();
      uvIndex = data.uvIndex;
      updateUVDisplay(uvIndex);
      adjustTimerBasedOnUV(uvIndex);
    } catch (error) {
      console.error('Error fetching UV index:', error);
    }
  }

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
    }
  }

  function triggerAlert() {
    alertMsg.textContent = "Time to reapply sunscreen!";
    alert("Time to reapply sunscreen!");
    timerBar.style.backgroundColor = '#f44336';
    timerBar.style.width = '0%';
  }

  reapplyBtn.addEventListener('click', () => {
    alertMsg.textContent = '';
    fetchUV();
    startTimer();
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
  fetchUV();
  startTimer();
  setInterval(fetchUV, 30000);
});
