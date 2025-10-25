document.addEventListener('DOMContentLoaded', () => {
  const uvCircle = document.getElementById('uv-circle');
  const uvValue = document.getElementById('uv-value');
  const timerDisplay = document.getElementById('timer');
  const reapplyBtn = document.getElementById('reapply-btn');
  const alertMsg = document.getElementById('alert-message');

  let timerDuration = 20 * 60; // 20 minutes in seconds
  let timeRemaining = timerDuration;
  let timerInterval;
  let uvIndex = 5;

  // Fetch UV index from backend (hardware later)
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
    uvCircle.style.setProperty('--uv-index', index);
    uvValue.textContent = index;
  }

  // Optional: adjust timer duration based on UV intensity
  function adjustTimerBasedOnUV(index) {
    if (index <= 3) timerDuration = 30 * 60; // low UV → 30 mins
    else if (index <= 6) timerDuration = 20 * 60; // moderate UV → 20 mins
    else if (index <= 9) timerDuration = 15 * 60; // high UV → 15 mins
    else timerDuration = 10 * 60; // extreme UV → 10 mins
  }

  function startTimer() {
    clearInterval(timerInterval);
    timeRemaining = timerDuration;

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
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function triggerAlert() {
    alertMsg.textContent = "Time to reapply sunscreen!";
    alertMsg.style.color = "red";
    alert("Time to reapply sunscreen!");
    // later: send a signal to backend to buzz the cap
  }

  reapplyBtn.addEventListener('click', () => {
    alertMsg.textContent = '';
    fetchUV(); // refresh UV on reapply
    startTimer(); // reset timer
  });

  // Initial setup
  fetchUV();
  startTimer();
  updateTimerDisplay();

  // Poll UV index every 30 seconds
  setInterval(fetchUV, 30000);
});
