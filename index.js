document.addEventListener('DOMContentLoaded', function () {
    // Audio files
    const audioFiles = {
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
    };

    // Audio context
    let audioContext;
    let audioBuffer;
    let audioSource;
    let gainNode;
    let currentSound = null;
    let isPlaying = false;
    let activeSeason = null;
    let activeSoundBtn = null;
    let timerId = null;
    let countdownInterval = null;
    let remainingTime = 0;
    let isTimerActive = false;
    const timerDurations = [
        { minutes: 5, display: '5m' },
        { minutes: 10, display: '10m' },
        { minutes: 15, display: '15m' },
        { minutes: 30, display: '30m' },
        { minutes: 60, display: '1h' },
        { minutes: 120, display: '2h' },
        { minutes: 180, display: '3h' }
    ];
    let currentTimerIndex = -1; // -1 means infinite

    // DOM elements
    const seasons = document.querySelectorAll('.season');
    const soundBtns = document.querySelectorAll('.sound-btn');
    const playBtns = document.querySelectorAll('.play-btn');
    const volumeSliders = document.querySelectorAll('.volume-slider');
    const timerBtns = document.querySelectorAll('.timer-btn');
    const leftArrow = document.querySelector('.nav-arrow-left');
    const rightArrow = document.querySelector('.nav-arrow-right');

    // Initialize audio context on first interaction
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = 0.7;
        }
    }

    // Load audio file
    async function loadAudio(file) {
        try {
            const response = await fetch(file);
            const arrayBuffer = await response.arrayBuffer();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            playAudio();
        } catch (error) {
            console.error('Error loading audio:', error);
        }
    }

    // Play audio
    function playAudio() {
        if (audioSource) {
            audioSource.stop();
        }

        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.loop = true;
        audioSource.connect(gainNode);
        audioSource.start();
        isPlaying = true;
        isTimerActive = true;

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
        if (currentTimerIndex !== -1) {
            startTimer();
        }
    }

    // Stop audio
    function stopAudio() {
        if (audioSource) {
            audioSource.stop();
            isPlaying = false;
            isTimerActive = false;

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
            if (activeSoundBtn) {
                activeSoundBtn.classList.remove('playing');
                activeSoundBtn = null;
            }
            currentSound = null;

            // Update timer button
            updateTimerButtons();
        }
        clearTimer();
    }

    // Timer functions
    function startTimer() {
        clearTimer();
        const duration = timerDurations[currentTimerIndex].minutes * 60 * 1000;
        remainingTime = duration;

        // Start countdown
        countdownInterval = setInterval(() => {
            remainingTime -= 1000;
            if (remainingTime <= 0) {
                stopAudio();
                currentTimerIndex = -1;
                updateTimerButtons();
                clearTimer();
            } else {
                updateTimerDisplay();
            }
        }, 1000);

        timerId = setTimeout(() => {
            stopAudio();
            currentTimerIndex = -1;
            updateTimerButtons();
        }, duration);
    }

    function clearTimer() {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    function updateTimerDisplay() {
        const minutes = Math.ceil(remainingTime / 1000 / 60);
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
        if (isTimerActive) {
            if (currentTimerIndex === -1) {
                displayText = '∞';
            } else {
                displayText = timerDurations[currentTimerIndex].display;
                if (countdownInterval) {
                    updateTimerDisplay();
                    return;
                }
            }
        }

        timerBtns.forEach(btn => {
            if (isTimerActive) {
                btn.classList.add('timer-active');
                btn.querySelector('.timer-text').textContent = displayText;
            } else {
                btn.classList.remove('timer-active');
                btn.querySelector('.timer-text').textContent = '';
            }
        });
    }

    // Function to set active season
    function setActiveSeason(index) {
        if (activeSeason) {
            activeSeason.classList.remove('active');
        }
        seasons[index].classList.add('active');
        activeSeason = seasons[index];

        // Reset sound and timer if switching seasons
        if (activeSoundBtn) {
            activeSoundBtn.classList.remove('playing');
            activeSoundBtn = null;
            stopAudio();
            currentSound = null;
            currentTimerIndex = -1;
            updateTimerButtons();
        }
    }

    // Season click interaction
    seasons.forEach((season, index) => {
        season.addEventListener('click', function () {
            if (season === activeSeason) {
                const nextIndex = (index + 1) % seasons.length;
                setActiveSeason(nextIndex);
            } else {
                setActiveSeason(index);
            }
        });
    });

    // Sound button click
    soundBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            
            // Check if the button's season is active
            const seasonElement = this.closest('.season');
            if (!seasonElement.classList.contains('active')) {
                return; // Exit if the season is not active
            }

            // If the clicked button is already playing, stop it
            if (this.classList.contains('playing')) {
                stopAudio();
                return;
            }

            initAudioContext();

            // Update active sound button
            if (activeSoundBtn) {
                activeSoundBtn.classList.remove('playing');
            }
            this.classList.add('playing');
            activeSoundBtn = this;

            // Reset timer to infinite when changing sounds
            currentTimerIndex = -1;
            updateTimerButtons();

            // Load and play selected sound
            const soundKey = this.dataset.sound;
            currentSound = soundKey;
            loadAudio(audioFiles[soundKey]);
        });
    });

    // Play/pause button
    playBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();

            if (isPlaying) {
                stopAudio();
            } else {
                if (!currentSound) {
                    // Play the first sound of the active season
                    const firstSoundBtn = activeSeason.querySelector('.sound-btn');
                    if (firstSoundBtn) {
                        firstSoundBtn.click();
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
            if (!isTimerActive) {
                return; // Ignore clicks when timer is inactive
            }
            // Cycle through durations, including infinity
            currentTimerIndex = (currentTimerIndex + 1) % (timerDurations.length + 1);
            updateTimerButtons();
            if (isPlaying && currentTimerIndex !== -1) {
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
            if (gainNode) {
                gainNode.gain.value = this.value;
            }
        });
        slider.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });

    // Arrow navigation
    leftArrow.addEventListener('click', () => {
        const currentIndex = Array.from(seasons).indexOf(activeSeason);
        const newIndex = (currentIndex - 1 + seasons.length) % seasons.length;
        setActiveSeason(newIndex);
    });

    rightArrow.addEventListener('click', () => {
        const currentIndex = Array.from(seasons).indexOf(activeSeason);
        const newIndex = (currentIndex + 1) % seasons.length;
        setActiveSeason(newIndex);
    });

    // Activate first season by default
    setActiveSeason(0);
});