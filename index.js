document.addEventListener('DOMContentLoaded', function () {
    const seasons = document.querySelectorAll('.season');
    let currSeasonInx = 0;

    function nextSeason(){
        if (currSeasonInx === seasons.length - 1) setActiveSeason(0);
        else setActiveSeason(currSeasonInx + 1);
    }

    function previousSeason(){
        if (currSeasonInx === 0) setActiveSeason(seasons.length - 1);
        else setActiveSeason(currSeasonInx - 1);
    }

    // Mobile navigation start

    const downArrow = document.getElementById('nav-arrow-down');

    downArrow.addEventListener('click', nextSeason);


    function setActiveSeason(nextSeasonInx) {
        seasons[currSeasonInx].classList.remove('active');
        seasons[nextSeasonInx].classList.add('active');
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

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    // Mobile navigation end

});