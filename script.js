// DOM Elements
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const toggleDarkMode = document.getElementById('toggleDarkMode');

// Timer variables
let interval;
const defaultDuration = 1200; // Default timer duration in seconds (20 minutes)
const restDuration = 20; // Rest timer duration in seconds (20 seconds)
const alarmSound = new Audio('i-have-eyes.mp3'); // Alarm sound

// Start Timer Function
function startTimer(duration) {
    let time = duration;

    // Clear any existing timer
    clearInterval(interval);

    // Update the timer immediately
    updateTimerDisplay(time);

    // Start the interval
    interval = setInterval(() => {
        time--;
        updateTimerDisplay(time);

        if (time < 0) {
            clearInterval(interval);
            alarmSound.play(); // Play alarm sound
            if (duration === defaultDuration) {
                startTimer(restDuration); // Start the 20-second rest timer
            } else {
                startTimer(defaultDuration); // Reset to default timer duration
            }
        }
    }, 1000);
}

// Function to update the timer display
function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Event Listeners
startButton.addEventListener('click', () => {
    startTimer(defaultDuration); // Start the timer with default duration
});

toggleDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});