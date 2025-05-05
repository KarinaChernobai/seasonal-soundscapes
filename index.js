class Season {
    constructor(name, descr, sounds) {
        this.name = name;
        this.descr = descr;
        this.sounds = sounds;
    }
};

class Sound {
    constructor(src, descr) {
        this.src = src;
        this.descr = descr;
    }
}

const seasons = [
    new Season("spring", "Awaken your senses with the gentle sounds of nature's rebirth - birdsong, babbling brooks, and soft spring rains.", 
        [new Sound("birds", "Morning Birds"), new Sound("brook", "Silver Stream"), new Sound("rain", "Spring Rain")]),
    new Season("summer", "Bask in the warm sounds of summer - ocean waves, crickets at dusk, and gentle breezes through palm trees.", 
        [new Sound("ocean", "Sea Whisper"), new Sound("crickets", "Summer Night"), new Sound("breeze", "Gentle Breeze")]),
    new Season("autumn", "Experience the crisp sounds of autumn - rustling leaves, distant thunderstorms, and peaceful rainfall.", 
        [new Sound("leaves", "Leaves rustle"), new Sound("thunder", "Distant Thunder"), new Sound("rainfall", "Autumn Rainfall")]),
    new Season("winter", "Cozy up with the comforting sounds of winter - crackling fires, falling snow, and the crisp crunch of footsteps on fresh snow.", 
        [new Sound("fireplace", "Crackling Fire"), new Sound("snowfall", "Falling Snow"), new Sound("snowcrunch", "Snow Crunch")]),
];
let currSeasonInx = 0;

document.addEventListener('DOMContentLoaded', function () {
    const seasonContainer = document.querySelector('.season');
    const soundBtns = document.querySelectorAll('.sound-btn');

    function nextSeason(){
        if (currSeasonInx === seasons.length - 1) setActiveSeason(0);
        else setActiveSeason(currSeasonInx + 1);
    }

    function previousSeason(){
        if (currSeasonInx === 0) setActiveSeason(seasons.length - 1);
        else setActiveSeason(currSeasonInx - 1);
    }

    // Mobile navigation start

    function setActiveSeason(nextSeasonInx) {
        seasonContainer.classList.remove(seasons[currSeasonInx].name);
        seasonContainer.classList.add(seasons[nextSeasonInx].name);
        const sounds = seasons[nextSeasonInx].sounds;
        if (sounds.length !== soundBtns.length) throw new Error(`The length of the season sounds array is ${sounds.length} while there are ${soundBtns.length} on the page.`);
        for (let index = 0; index < sounds.length; index++) {
            const btn = soundBtns[index];
            const sound = sounds[index];
            btn.setAttribute("data-sound", sound.src);
            btn.textContent = sound.descr;
        }
        currSeasonInx = nextSeasonInx;
    };

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

    const downArrow = document.getElementById('nav-arrow-down');
    downArrow.addEventListener('click', nextSeason);


    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    // Mobile navigation end

});