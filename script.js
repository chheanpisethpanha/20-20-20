// DOM Elements
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const toggleDarkMode = document.getElementById('toggleDarkMode');
const notificationText = document.getElementById('notificationText');

// Timer variables
let interval;
let isRunning = false;
let isRestPeriod = false; // Track if we're in rest period
const defaultDuration = 1200; // Default timer duration in seconds (20 minutes)
const restDuration = 20; // Rest timer duration in seconds (20 seconds)
const alarmSound = new Audio('i-have-eyes.mp3'); // Alarm sound

// Update notification status display
function updateNotificationStatus() {
    if (!('Notification' in window)) {
        notificationText.textContent = 'Notifications: Not supported';
        notificationText.classList.add('text-red-400');
    } else if (Notification.permission === 'granted') {
        notificationText.textContent = 'Notifications: Enabled ✓';
        notificationText.classList.remove('text-gray-500', 'text-red-400');
        notificationText.classList.add('text-green-400');
    } else if (Notification.permission === 'denied') {
        notificationText.textContent = 'Notifications: Blocked ✗';
        notificationText.classList.remove('text-gray-500', 'text-green-400');
        notificationText.classList.add('text-red-400');
    } else {
        notificationText.textContent = 'Notifications: Click Start to enable';
        notificationText.classList.remove('text-green-400', 'text-red-400');
        notificationText.classList.add('text-gray-500');
    }
}

// Update status on page load
updateNotificationStatus();

// Function to send notification
function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23fc4903"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23fc4903"><circle cx="12" cy="12" r="10"/></svg>',
            requireInteraction: true,
            tag: '20-20-20-timer'
        });

        // Auto-close notification after 10 seconds
        setTimeout(() => notification.close(), 10000);
    }
}

// Start Timer Function
function startTimer(duration, isRest = false) {
    let time = duration;
    isRunning = true;
    isRestPeriod = isRest;
    startButton.textContent = 'Pause Timer';

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

            if (isRestPeriod) {
                // Rest period ended, start work timer
                sendNotification(
                    '✅ Rest Complete!',
                    'Time to get back to work! Starting 20-minute work timer.'
                );
                startTimer(defaultDuration, false); // Start the 20-minute work timer
            } else {
                // Work period ended, start rest timer
                sendNotification(
                    '👀 Time for a break!',
                    'Look at something 20 feet away for 20 seconds to rest your eyes.'
                );
                startTimer(restDuration, true); // Start the 20-second rest timer
            }
        }
    }, 1000);
}

// Pause Timer Function
function pauseTimer() {
    clearInterval(interval);
    isRunning = false;
    startButton.textContent = 'Start Timer';
}

// Reset Timer Function
function resetTimer() {
    clearInterval(interval);
    isRunning = false;
    isRestPeriod = false;
    startButton.textContent = 'Start Timer';
    updateTimerDisplay(defaultDuration);
}

// Function to update the timer display
function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Event Listeners
startButton.addEventListener('click', () => {
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(() => updateNotificationStatus());
    }

    if (isRunning) {
        pauseTimer();
    } else {
        const currentTime = timerDisplay.textContent.split(':');
        const minutes = parseInt(currentTime[0]);
        const seconds = parseInt(currentTime[1]);
        const totalSeconds = minutes * 60 + seconds;

        // Determine if this is a rest period based on duration
        const isRest = totalSeconds <= restDuration;
        startTimer(totalSeconds, isRest);
    }
});

resetButton.addEventListener('click', () => {
    resetTimer();
});

toggleDarkMode.addEventListener('click', () => {
    const body = document.body;
    const isDark = body.classList.contains('bg-off-black');

    if (isDark) {
        body.classList.remove('bg-off-black', 'text-gray-100');
        body.classList.add('bg-gray-50', 'text-gray-900');
        toggleDarkMode.innerHTML = `<svg class="w-6 h-6 text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
    } else {
        body.classList.remove('bg-gray-50', 'text-gray-900');
        body.classList.add('bg-off-black', 'text-gray-100');
        toggleDarkMode.innerHTML = `<svg class="w-6 h-6 text-gray-400 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
    }
});