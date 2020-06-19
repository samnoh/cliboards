'use strict';

(function () {
    const body = document.querySelector('body');
    const imageBoxes = body.querySelectorAll('img, video');
    const youtubeVideos = body.querySelectorAll('.youtube-video');

    let zoomedImageIndex = 0;
    let barsTimer = null;

    function pauseYoutubeVideos() {
        if (!youtubeVideos.length) return;

        youtubeVideos.forEach(ytVideo => {
            ytVideo.contentWindow.postMessage(
                '{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
                '*',
            );
        });
    }

    function toggleLockBodyScroll() {
        body.style.overflowY =
            body.style.overflowY === 'hidden' ? 'auto' : 'hidden';
    }

    function fadeInBars() {
        clearTimeout(barsTimer);

        const barContainer = document.querySelector('.bar-container');
        barContainer.classList.add('fade-in');
        barContainer.classList.remove('fade-out');

        barsTimer = setTimeout(fadeOutBars, 1500);
    }

    function fadeOutBars() {
        const barContainer = document.querySelector('.bar-container');
        barContainer.classList.add('fade-out');
        barContainer.classList.remove('fade-in');
    }

    function createBars() {
        const popupImageBox = document.querySelector('.popup-image-box');
        const barContainer = document.createElement('div');
        barContainer.classList.add('bar-container');
        const bars = document.createElement('div');
        bars.classList.add('bars');
        barContainer.appendChild(bars);

        for (let i = 0; i < imageBoxes.length; i++) {
            const bar = document.createElement('div');
            bar.classList.add(
                'bar',
                i === zoomedImageIndex ? 'active' : 'inactive',
            );
            bar.dataset.barIndex = i;
            bar.addEventListener('click', function (e) {
                zoomedImageIndex = parseInt(e.target.dataset.barIndex);
                moveToNextImage();
            });

            bars.appendChild(bar);
        }

        popupImageBox.appendChild(barContainer);

        document.addEventListener('mousemove', fadeInBars);
    }

    function popupImageKeyEvent(e) {
        switch (e.keyCode) {
            case 37:
            case 38: // prev
                zoomedImageIndex = zoomedImageIndex
                    ? zoomedImageIndex - 1
                    : imageBoxes.length - 1;
                return moveToNextImage();
            case 32:
            case 39:
            case 40: // next
                zoomedImageIndex = (zoomedImageIndex + 1) % imageBoxes.length;
                return moveToNextImage();
            case 81:
            case 27: // close
                return closePopupImage();
        }
    }

    function closePopupImage() {
        clearTimeout(barsTimer);

        document.removeEventListener('keydown', popupImageKeyEvent);
        document.removeEventListener('mousemove', fadeInBars);

        const barContainer = document.querySelector('.bar-container');
        barContainer && barContainer.remove();

        const popupImageBox = document.querySelector('.popup-image-box');
        popupImageBox.classList.add('fade-out');

        setTimeout(function () {
            popupImageBox && popupImageBox.remove();
        }, 200);

        toggleLockBodyScroll();
    }

    function moveToNextImage() {
        const popupImageBox = document.querySelector('.popup-image-box');

        popupImageBox.childNodes.forEach(function (c) {
            if (c.classList.contains('bar-container')) return;

            c.removeEventListener('click', closePopupImage);
            c.remove();
        });

        const bars = document.querySelectorAll('.bar-container .bar');

        if (!bars.length && imageBoxes.length > 1) {
            createBars();
            fadeInBars();
        } else if (bars.length) {
            const activeBar = document.querySelector('.bar.active');
            activeBar.classList.remove('active');
            bars[zoomedImageIndex].classList.add('active');
            fadeInBars();
        }

        const nextImageEl = imageBoxes[zoomedImageIndex];
        const imageBox = nextImageEl.parentNode.cloneNode(true);
        const imageEl = imageBox.querySelector('img, video');

        popupImageBox.appendChild(imageBox);

        imageEl.addEventListener('click', closePopupImage);
    }

    function openPopupImage(e) {
        toggleLockBodyScroll();

        pauseYoutubeVideos();

        document.addEventListener('keydown', popupImageKeyEvent);

        zoomedImageIndex = parseInt(e.target.parentNode.dataset.imageIndex);

        const popupImageBox = document.createElement('div');
        popupImageBox.classList.add('popup-image-box');
        body.appendChild(popupImageBox);

        moveToNextImage();
    }

    imageBoxes.forEach(function (box) {
        box.addEventListener('click', openPopupImage);
    });
})();
