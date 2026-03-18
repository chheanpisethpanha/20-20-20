// DOM Elements
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const toggleDarkMode = document.getElementById('toggleDarkMode');
const notificationText = document.getElementById('notificationText');
const soundButton = document.getElementById('soundButton');
const soundMenu = document.getElementById('soundMenu');

// Timer variables
let interval;
let isRunning = false;
let isRestPeriod = false;
const defaultDuration = 1200;
const restDuration = 20;

function makeSound(src) {
    const a = new Audio(src);
    a.volume = 0.3;
    return a;
}

let startSound = makeSound('throwing-flashbang-sound-effect-cs-go.mp3');
let endSound = makeSound('sector-clear.mp3');

// Sound picker
soundButton.addEventListener('click', (e) => {
    e.stopPropagation();
    soundMenu.classList.toggle('hidden');
});

document.addEventListener('click', () => soundMenu.classList.add('hidden'));

document.querySelectorAll('.sound-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        const src = btn.dataset.sound;
        const preview = makeSound(src);
        preview.play();

        if (section === 'start') {
            startSound = makeSound(src);
            document.querySelectorAll('.sound-option[data-section="start"]').forEach(b => b.classList.remove('text-accent'));
        } else {
            endSound = makeSound(src);
            document.querySelectorAll('.sound-option[data-section="end"]').forEach(b => b.classList.remove('text-accent'));
        }
        btn.classList.add('text-accent');
        soundMenu.classList.add('hidden');
    });
});

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
    const endTime = Date.now() + duration * 1000;
    isRunning = true;
    isRestPeriod = isRest;
    startButton.textContent = 'Pause Timer';

    // Clear any existing timer
    clearInterval(interval);

    // Update the timer immediately
    updateTimerDisplay(duration);

    // Start the interval — remaining time is always derived from wall clock,
    // so background tab throttling won't cause drift or missed alarms.
    interval = setInterval(() => {
        const remaining = Math.round((endTime - Date.now()) / 1000);
        updateTimerDisplay(Math.max(0, remaining));

        if (remaining <= 0) {
            clearInterval(interval);

            if (isRestPeriod) {
                // Rest period ended — play end sound, go back to work
                endSound.play();
                if (flashbangMode) setLightMode(false);
                sendNotification(
                    '✅ Rest Complete!',
                    'Time to get back to work! Starting 20-minute work timer.'
                );
                startTimer(defaultDuration, false);
            } else {
                // Work period ended — play start sound, begin rest
                startSound.play();
                if (flashbangMode) setLightMode(true);
                sendNotification(
                    '👀 Time for a break!',
                    'Look at something 20 feet away for 20 seconds to rest your eyes.'
                );
                startTimer(restDuration, true);
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

function setLightMode(light) {
    const body = document.body;
    const starfield = document.getElementById('starfield');
    const dotGrid = document.getElementById('dot-grid');
    if (light) {
        body.classList.remove('bg-off-black', 'text-gray-100');
        body.classList.add('bg-gray-50', 'text-gray-900');
        starfield.style.opacity = '0';
        dotGrid.style.opacity = '1';
        toggleDarkMode.innerHTML = `<svg class="w-6 h-6 text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
    } else {
        body.classList.remove('bg-gray-50', 'text-gray-900');
        body.classList.add('bg-off-black', 'text-gray-100');
        starfield.style.opacity = '1';
        dotGrid.style.opacity = '0';
        toggleDarkMode.innerHTML = `<svg class="w-6 h-6 text-gray-400 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
    }
}

toggleDarkMode.addEventListener('click', () => {
    const isDark = document.body.classList.contains('bg-off-black');
    setLightMode(isDark);
});

// Flashbang mode
let flashbangMode = false;
const flashbangToggle = document.getElementById('flashbangToggle');

flashbangToggle.addEventListener('click', () => {
    if (!flashbangMode) {
        const ok = confirm('⚡ Flashbang mode: light mode will auto-enable when your break starts.\n\n⚠️ WARNING: The sudden screen flash may trigger photosensitive epilepsy. Do not enable if you or anyone nearby is sensitive to sudden bright light changes.\n\nEnable anyway?');
        if (!ok) return;
        flashbangMode = true;
        flashbangToggle.classList.remove('border-off-black-lighter', 'hover:border-yellow-500');
        flashbangToggle.classList.add('border-yellow-500');
        flashbangToggle.querySelector('svg').classList.remove('text-gray-600', 'group-hover:text-yellow-400');
        flashbangToggle.querySelector('svg').classList.add('text-yellow-400');
    } else {
        flashbangMode = false;
        flashbangToggle.classList.add('border-off-black-lighter', 'hover:border-yellow-500');
        flashbangToggle.classList.remove('border-yellow-500');
        flashbangToggle.querySelector('svg').classList.add('text-gray-600', 'group-hover:text-yellow-400');
        flashbangToggle.querySelector('svg').classList.remove('text-yellow-400');
    }
});

// Starfield background animation
(function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];

    function createStars() {
        stars = [];
        const count = Math.max(80, Math.floor((canvas.width * canvas.height) / 5000));
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.4 + 0.2,
                alpha: Math.random(),
                speed: (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
            });
        }
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStars();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const s of stars) {
            s.alpha += s.speed;
            if (s.alpha >= 1)    { s.alpha = 1;    s.speed = -Math.abs(s.speed); }
            if (s.alpha <= 0.08) { s.alpha = 0.08; s.speed =  Math.abs(s.speed); }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
}());