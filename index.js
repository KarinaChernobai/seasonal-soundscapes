class Season {
    constructor(name, descr, sounds) {
        this.name = name;
        this.descr = descr;
        this.sounds = sounds;
    }
}

class Sound {
    constructor(src, descr) {
        this.src = src;
        this.descr = descr;
    }
}

// App state
const appState = {
    seasons: [
        new Season("spring", "Awaken your senses with the gentle sounds of nature's rebirth - birdsong, babbling brooks, and soft spring rains.", 
            [new Sound("birds", "Morning Birds"), new Sound("brook", "Silver Stream"), new Sound("rain", "Spring Rain")]),
        new Season("summer", "Bask in the warm sounds of summer - ocean waves, crickets at dusk, and gentle breezes through palm trees.", 
            [new Sound("ocean", "Sea Whisper"), new Sound("crickets", "Summer Night"), new Sound("breeze", "Gentle Breeze")]),
        new Season("autumn", "Experience the crisp sounds of autumn - rustling leaves, distant thunderstorms, and peaceful rainfall.", 
            [new Sound("leaves", "Leaves rustle"), new Sound("thunder", "Distant Thunder"), new Sound("rainfall", "Autumn Rainfall")]),
        new Season("winter", "Cozy up with the comforting sounds of winter - crackling fires, falling snow, and the crisp crunch of footsteps on fresh snow.", 
            [new Sound("fireplace", "Crackling Fire"), new Sound("snowfall", "Falling Snow"), new Sound("snowcrunch", "Snow Crunch")]),
    ],
    currentSeasonIndex: 0,
    audioFiles: {
        birds: 'sounds/spring/birds.mp3',
        brook: 'sounds/spring/brook.mp3',
        rain: 'sounds/spring/rain.mp3',
        ocean: 'sounds/summer/ocean.mp3',
        crickets: 'sounds/summer/crickets.mp3',
        breeze: 'sounds/summer/breeze.mp3',
        leaves: 'sounds/autumn/leaves.mp3',
        thunder: 'sounds/autumn/thunder.mp3',
        rainfall: 'sounds/autumn/rainfall.mp3',
        fireplace: 'sounds/winter/fireplace.mp3',
        snowfall: 'sounds/winter/snowfall.mp3',
        snowcrunch: 'sounds/winter/snowcrunch.mp3'
    },
    timerDurations: [
        { minutes: 5, display: '5m' },
        { minutes: 10, display: '10m' },
        { minutes: 15, display: '15m' },
        { minutes: 30, display: '30m' },
        { minutes: 60, display: '1h' },
        { minutes: 120, display: '2h' },
        { minutes: 180, display: '3h' }
    ],
    audioContext: null,
    audioBuffers: {}, // Store preloaded buffers here
    isPreloading: false,
    audioSource: null,
    gainNode: null,
    currentSound: null,
    isPlaying: false,
    activeSoundBtn: null,
    timerId: null,
    countdownInterval: null,
    remainingTime: 0,
    isTimerActive: false,
    currentTimerIndex: -1 // -1 means infinite
};

document.addEventListener('DOMContentLoaded', function () {
    // Initialize DOM elements
    const mobileSeasonContainer = document.querySelector('.mobile-container .season');
    const mobileSoundBtns = document.querySelectorAll('.mobile-container .sound-btn');
    const desktopSeasons = document.querySelectorAll('.app-container .season');
    const allSoundBtns = document.querySelectorAll('.sound-btn');
    const playBtns = document.querySelectorAll('.play-btn');
    const volumeSliders = document.querySelectorAll('.volume-slider');
    const timerBtns = document.querySelectorAll('.timer-btn');
    const leftArrow = document.querySelector('.nav-arrow-left');
    const rightArrow = document.querySelector('.nav-arrow-right');
    const downArrow = document.getElementById('nav-arrow-down');

    // Initialize audio context on first interaction
    function initAudioContext() {
        if (!appState.audioContext) {
            appState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            appState.gainNode = appState.audioContext.createGain();
            appState.gainNode.connect(appState.audioContext.destination);
            appState.gainNode.gain.value = 0.7;
            
            // Start preloading after context is created
            preloadAllAudio();
        }
    }

    // Preload audio file
    async function preloadAllAudio() {
        appState.isPreloading = true;
        try {
            const audioFiles = Object.values(appState.audioFiles);
            const buffers = await Promise.all(
                audioFiles.map(file => fetch(file)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => appState.audioContext.decodeAudioData(arrayBuffer))
            ));
            
            // Store buffers in appState.audioBuffers
            Object.keys(appState.audioFiles).forEach((key, index) => {
                appState.audioBuffers[key] = buffers[index];
            });
        } catch (error) {
            console.error('Error preloading audio:', error);
        }
        appState.isPreloading = false;
    }

    // Load audio file
    async function loadAudio(file) {
        const soundKey = Object.keys(appState.audioFiles).find(key => appState.audioFiles[key] === file);
        
        if (appState.audioBuffers[soundKey]) {
            appState.audioBuffer = appState.audioBuffers[soundKey];
            playAudio();
        } else {
            try {
                const response = await fetch(file);
                const arrayBuffer = await response.arrayBuffer();
                appState.audioBuffer = await appState.audioContext.decodeAudioData(arrayBuffer);
                playAudio();
            } catch (error) {
                console.error('Error loading audio:', error);
            }
        }
    }

    // Play audio
    function playAudio() {
        if (appState.audioSource) {
            appState.audioSource.stop();
        }

        appState.audioSource = appState.audioContext.createBufferSource(); // Returns AudioBufferSourceNode
        appState.audioSource.buffer = appState.audioBuffer;
        appState.audioSource.loop = true;
        appState.audioSource.connect(appState.gainNode);
        appState.audioSource.start();
        appState.isPlaying = true;
        appState.isTimerActive = true;

        // Update play button icon and add playing class
        playBtns.forEach(btn => {
            btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            `;
            btn.classList.add('playing');
        });

        // Update timer button state
        updateTimerButtons();

        // Start timer if one is set
        if (appState.currentTimerIndex !== -1) {
            startTimer();
        }
    }

    // Stop audio
    function stopAudio() {
        if (appState.audioSource) {
            appState.audioSource.stop();
            appState.isPlaying = false;
            appState.isTimerActive = false;

            // Update play button icon and remove playing class
            playBtns.forEach(btn => {
                btn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                `;
                btn.classList.remove('playing');
            });

            // Reset sound button
            if (appState.activeSoundBtn) {
                appState.activeSoundBtn.classList.remove('playing');
                appState.activeSoundBtn = null;
            }
            appState.currentSound = null;

            // Update timer button
            updateTimerButtons();
        }
        clearTimer();
    }

    // Timer functions
    function startTimer() {
        clearTimer();
        const duration = appState.timerDurations[appState.currentTimerIndex].minutes * 60 * 1000;
        appState.remainingTime = duration;

        // Start countdown
        appState.countdownInterval = setInterval(() => {
            appState.remainingTime -= 1000;
            if (appState.remainingTime <= 0) {
                stopAudio();
                appState.currentTimerIndex = -1;
                updateTimerButtons();
                clearTimer();
            } else {
                updateTimerDisplay();
            }
        }, 1000);

        appState.timerId = setTimeout(() => {
            stopAudio();
            appState.currentTimerIndex = -1;
            updateTimerButtons();
        }, duration);
    }

    function clearTimer() {
        if (appState.timerId) {
            clearTimeout(appState.timerId);
            appState.timerId = null;
        }
        if (appState.countdownInterval) {
            clearInterval(appState.countdownInterval);
            appState.countdownInterval = null;
        }
    }

    function updateTimerDisplay() {
        const minutes = Math.ceil(appState.remainingTime / 1000 / 60);
        let displayText;
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            displayText = `${hours}h`;
        } else {
            displayText = `${minutes}m`;
        }
        timerBtns.forEach(btn => {
            btn.querySelector('.timer-text').textContent = displayText;
        });
    }

    function updateTimerButtons() {
        let displayText = '∞';
        if (appState.isTimerActive) {
            if (appState.currentTimerIndex === -1) {
                displayText = '∞';
            } else {
                displayText = appState.timerDurations[appState.currentTimerIndex].display;
                if (appState.countdownInterval) {
                    updateTimerDisplay();
                    return;
                }
            }
        }

        timerBtns.forEach(btn => {
            if (appState.isTimerActive) {
                btn.classList.add('timer-active');
                btn.querySelector('.timer-text').textContent = displayText;
            } else {
                btn.classList.remove('timer-active');
                btn.querySelector('.timer-text').textContent = '∞';
            }
        });
    }

    // Season navigation
    function setActiveSeason(index) {
        appState.currentSeasonIndex = index;
        
        // Update mobile view
        if (mobileSeasonContainer) {
            // Remove all season classes
            mobileSeasonContainer.classList.remove('spring', 'summer', 'autumn', 'winter');
            // Add current season class
            mobileSeasonContainer.classList.add(appState.seasons[index].name);
            
            // Update sound buttons
            const sounds = appState.seasons[index].sounds;
            for (let i = 0; i < sounds.length && i < mobileSoundBtns.length; i++) {
                const btn = mobileSoundBtns[i];
                const sound = sounds[i];
                btn.setAttribute("data-sound", sound.src);
                btn.textContent = sound.descr;
            }
        }
        
        // Update desktop view
        desktopSeasons.forEach((season, i) => {
            if (i === index) {
                season.classList.add('active');
            } else {
                season.classList.remove('active');
            }
        });
        // Reset sound and timer if switching seasons
        if (appState.activeSoundBtn) {
            appState.activeSoundBtn.classList.remove('playing');
            appState.activeSoundBtn = null;
            stopAudio();
            appState.currentSound = null;
            appState.currentTimerIndex = -1;
            updateTimerButtons();
        }
    }

    function nextSeason() {
        const nextIndex = (appState.currentSeasonIndex + 1) % appState.seasons.length;
        setActiveSeason(nextIndex);
    }

    function previousSeason() {
        const prevIndex = (appState.currentSeasonIndex - 1 + appState.seasons.length) % appState.seasons.length;
        setActiveSeason(prevIndex);
    }

    // Mobile swipe detection
    let touchStartY = 0;
    let touchEndY = 0;

    function handleTouchStart(e) {
        touchStartY = e.changedTouches[0].screenY;
    }

    function handleTouchEnd(e) {
        if (window.innerWidth > 768) return; // Only for mobile

        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }

    function handleSwipe() {
        const threshold = 30; // Minimum swipe distance

        if (touchEndY < touchStartY - threshold) {
            // Swiped up - next season
            nextSeason();
        } else if (touchEndY > touchStartY + threshold) {
            // Swiped down - previous season
            previousSeason();
        }
    }

    if (downArrow) {
        downArrow.addEventListener('click', nextSeason);
    }

    if (leftArrow) {
        leftArrow.addEventListener('click', previousSeason);
    }

    if (rightArrow) {
        rightArrow.addEventListener('click', nextSeason);
    }

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    // Desktop season click handling
    desktopSeasons.forEach((season, index) => {
        season.addEventListener('click', function(e) {
            // Don't handle clicks if the season is already active
            if (season.classList.contains('active')) {
                return;
            }
            
            setActiveSeason(index);
        });
    });

    // Sound button click
    allSoundBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {

            // Check if the button's season is active
            const seasonElement = this.closest('.season');
            if (!seasonElement.classList.contains('active')) {
                return; // Exit if the season is not active
            }

            e.stopPropagation();

            if (this.classList.contains('playing')) {
                stopAudio();
                return;
            }

            initAudioContext();

            // Update active sound button
            if (appState.activeSoundBtn) {
                appState.activeSoundBtn.classList.remove('playing');
            }
            this.classList.add('playing');
            appState.activeSoundBtn = this;

            // Reset timer to infinite when changing sounds
            appState.currentTimerIndex = -1;
            updateTimerButtons();

            // Load and play selected sound
            const soundKey = this.dataset.sound;
            appState.currentSound = soundKey;
            loadAudio(appState.audioFiles[soundKey]);
        });
    });

    // Play/pause button
    playBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();

            if (appState.isPlaying) {
                stopAudio();
            } else {
                if (!appState.currentSound) {
                    // Play the first sound of the active season
                    let activeSeasonElement;
                    
                    if (window.innerWidth >= 768) {
                        const seasonElement = this.closest('.season');
                        if (!seasonElement.classList.contains('active')) {
                            const seasonIndex = Array.from(desktopSeasons).indexOf(seasonElement);
                            setActiveSeason(seasonIndex);
                        }
                        activeSeasonElement = seasonElement;
                    } else {
                        activeSeasonElement = document.querySelector('.season.active');
                    }
                    
                    if (activeSeasonElement) {
                        const firstSoundBtn = activeSeasonElement.querySelector('.sound-btn');
                        if (firstSoundBtn) {
                            firstSoundBtn.click();
                        }
                    }
                } else {
                    playAudio();
                }
            }
        });
    });

    // Timer button click
    timerBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!appState.isTimerActive) {
                return; // Ignore clicks when timer is inactive
            }
            // Cycle through durations
            appState.currentTimerIndex = appState.currentTimerIndex + 1;
            if (appState.currentTimerIndex === appState.timerDurations.length) {
                appState.currentTimerIndex = -1; // Set to infinite
            }
            updateTimerButtons();
            if (appState.isPlaying && appState.currentTimerIndex !== -1) {
                startTimer();
            } else {
                clearTimer();
            }
        });
    });

    // Volume control
    volumeSliders.forEach(slider => {
        slider.addEventListener('input', function (e) {
            e.stopPropagation();
            if (appState.gainNode) {
                appState.gainNode.gain.value = this.value;
            }
        });
        slider.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });

    // Initialize the app
    setActiveSeason(0);
});