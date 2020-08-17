'use strict';

(function () {
    const imageBoxes = body.querySelectorAll('img, video');
    const BOTTOM_BAR_TIMER_SECOND = 1;

    let _activeImageIndex = 0;
    let barsTimer = null;

    function getActiveImageIndex() {
        return _activeImageIndex;
    }

    function setActiveImageIndex(index) {
        if (index < 0 || index >= imageBoxes.length) return;
        _activeImageIndex = parseInt(index);
    }

    function getImageViewerContainer() {
        return document.querySelector('.popup-image-box');
    }

    // bottom bars
    function getBottomBarContainer() {
        return document.querySelector('.bar-container');
    }

    const fadeInBottomBarsHandler = debounce(
        fadeInBottomBars,
        BOTTOM_BAR_TIMER_SECOND * 1000 - 100,
    );

    function createBottomBars() {
        const imageViewerBox = getImageViewerContainer();
        const activeImageIndex = getActiveImageIndex();

        const bottomBarContainer = createElement({
            className: 'bar-container',
            parent: imageViewerBox,
        });
        const bottomBars = createElement({
            className: 'bars',
            parent: bottomBarContainer,
        });

        for (let i = 0; i < imageBoxes.length; i++) {
            const bar = createElement({
                className: [
                    'bar',
                    i === activeImageIndex ? 'active' : 'inactive',
                ],
                attr: {
                    'dataset.barIndex': i,
                },
                parent: bottomBars,
            });

            bar.addEventListener('click', function (e) {
                moveToNextImage(e.target.dataset.barIndex);
            });
        }

        imageViewerBox.addEventListener('mousemove', fadeInBottomBarsHandler);
    }

    function fadeOutBottomBars() {
        const bottomBarContainer = getBottomBarContainer();
        bottomBarContainer.classList.add('fade-out');
        bottomBarContainer.classList.remove('fade-in');
    }

    function fadeInBottomBars() {
        clearTimeout(barsTimer);

        const bottomBarContainer = getBottomBarContainer();
        bottomBarContainer.classList.add('fade-in');
        bottomBarContainer.classList.remove('fade-out');

        barsTimer = setTimeout(
            fadeOutBottomBars,
            BOTTOM_BAR_TIMER_SECOND * 1000,
        );
    }

    // image viewer
    function closeImageViewer() {
        cleanUpImageViewerEvents();
        toggleLockBodyScroll();

        const bottomBarContainer = getBottomBarContainer();
        bottomBarContainer && bottomBarContainer.remove();

        const imageViewerBox = getImageViewerContainer();
        imageViewerBox.classList.add('fade-out');

        setTimeout(function () {
            imageViewerBox && imageViewerBox.remove();
        }, 200);
    }

    function moveToNextImage(activeImageIndex = 0) {
        setActiveImageIndex(activeImageIndex);
        cleanUpPrevImageViewerEvents();

        const imageViewerBox = getImageViewerContainer();
        const bottomBars = document.querySelectorAll('.bar-container .bar');

        if (!bottomBars.length && imageBoxes.length > 1) {
            // when opening image viewer initally
            createBottomBars();
            fadeInBottomBars();
        } else if (bottomBars.length) {
            const activeBar = document.querySelector('.bar.active');
            activeBar.classList.remove('active');
            bottomBars[activeImageIndex].classList.add('active');
            fadeInBottomBars();
        }

        const nextImageEl = imageBoxes[activeImageIndex];
        const imageBox = nextImageEl.parentNode.cloneNode(true);
        imageViewerBox.appendChild(imageBox);

        addImageBoxEventListner(imageBox);
    }

    function openImageViewer(e) {
        toggleLockBodyScroll();
        pauseYoutubeVideos('.youtube-video');
        createElement({ className: 'popup-image-box', parent: body });
        addImageViwerEventListener();
        moveToNextImage(e.target.parentNode.dataset.imageIndex);
    }

    // events
    function imageViewerKeyEvent(e) {
        const activeImageIndex = getActiveImageIndex();

        switch (e.keyCode) {
            case 37:
            case 38: // prev
                return moveToNextImage(
                    activeImageIndex
                        ? activeImageIndex - 1
                        : imageBoxes.length - 1,
                );
            case 32:
            case 39:
            case 40: // next
                return moveToNextImage(
                    (activeImageIndex + 1) % imageBoxes.length,
                );
            case 81:
            case 27: // close
                return closeImageViewer();
        }
    }
    const imageViewerKeyEventHandler = debounce(imageViewerKeyEvent, 150);

    function cleanUpPrevImageViewerEvents() {
        const imageViewerBox = getImageViewerContainer();

        imageViewerBox.childNodes.forEach(function (c) {
            if (c.classList.contains('bar-container')) return;
            c.removeEventListener('click', closeImageViewer);
            c.remove();
        });
    }

    function cleanUpImageViewerEvents() {
        const imageViewerBox = getImageViewerContainer();

        clearTimeout(barsTimer);

        document.removeEventListener('keydown', imageViewerKeyEventHandler);
        imageViewerBox.removeEventListener(
            'mousemove',
            fadeInBottomBarsHandler,
        );
    }

    function addImageViwerEventListener() {
        document.addEventListener('keydown', imageViewerKeyEventHandler);
    }

    function addImageBoxEventListner(container) {
        const imageEl = container.querySelector('img, video');
        imageEl.addEventListener('click', closeImageViewer);
    }

    function addImageBoxesEventListeners() {
        imageBoxes.forEach(function (box) {
            box.addEventListener('click', openImageViewer);
        });
    }

    window.addEventListener('load', addImageBoxesEventListeners);
})();
