document.addEventListener('DOMContentLoaded', function () {
    // Audio files
    const audioFiles = {
        // Spring
        birds: 'sounds/spring/birds.mp3',
        brook: 'sounds/spring/brook.mp3',
        rain: 'sounds/spring/rain.mp3',

        // Summer
        ocean: 'sounds/summer/ocean.mp3',
        crickets: 'sounds/summer/crickets.mp3',
        breeze: 'sounds/summer/breeze.mp3',

        // Autumn
        leaves: 'sounds/autumn/leaves.mp3',
        thunder: 'sounds/autumn/thunder.mp3',
        rainfall: 'sounds/autumn/rainfall.mp3',

        // Winter
        fireplace: 'sounds/winter/fireplace.mp3',
        snowfall: 'sounds/winter/snowfall.mp3',
        wind: 'sounds/winter/wind.mp3'
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

    // DOM elements
    const seasons = document.querySelectorAll('.season');
    const soundBtns = document.querySelectorAll('.sound-btn');
    const playBtns = document.querySelectorAll('.play-btn');
    const volumeSliders = document.querySelectorAll('.volume-slider');
    // New: Arrow buttons
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

        // Update play button icon
        playBtns.forEach(btn => {
            btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `;
        });
    }

    // Stop audio
    function stopAudio() {
        if (audioSource) {
            audioSource.stop();
            isPlaying = false;

            // Update play button icon
            playBtns.forEach(btn => {
                btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          `;
            });
        }
    }

    // New: Function to set active season
    function setActiveSeason(index) {
        if (activeSeason) {
            activeSeason.classList.remove('active');
        }
        seasons[index].classList.add('active');
        activeSeason = seasons[index];

        // Optional: Reset sound if switching seasons
        if (activeSoundBtn) {
            activeSoundBtn.classList.remove('playing');
            activeSoundBtn = null;
            stopAudio();
            currentSound = null;
        }
    }

    // Season click interaction
    seasons.forEach((season, index) => {
        season.addEventListener('click', function () {
            if (season === activeSeason) {
                // If clicking the active season, cycle to the next one
                const nextIndex = (index + 1) % seasons.length;
                setActiveSeason(nextIndex);
            } else {
                // If clicking an inactive season, switch to it
                setActiveSeason(index);
            }
        });
    });

    // Sound button click
    soundBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            initAudioContext();

            // Update active sound button
            if (activeSoundBtn) {
                activeSoundBtn.classList.remove('playing');
            }
            this.classList.add('playing');
            activeSoundBtn = this;

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

            if (!currentSound) return;

            if (isPlaying) {
                stopAudio();
            } else {
                playAudio();
            }
        });
    });

    // Volume control
    volumeSliders.forEach(slider => {
        slider.addEventListener('input', function () {
            if (gainNode) {
                gainNode.gain.value = this.value;
            }
        });
    });

    // New: Arrow navigation
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