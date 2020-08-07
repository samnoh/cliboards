'use strict';

(function () {
    const imageBoxes = body.querySelectorAll('img, video');
    const BOTTOM_BAR_TIMER_SECOND = 0.5;

    let _activeImageIndex = 0;
    let barsTimer = null;

    function getActiveImageIndex() {
        return _activeImageIndex;
    }

    function setActiveImage(index) {
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
                setActiveImage(e.target.dataset.barIndex);
                moveToNextImage();
            });
        }

        imageViewerBox.addEventListener('mousemove', fadeInBottomBars);
    }

    function fadeOutBottomBars(type) {
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

        const bottomBarContainer = getBottomBarContainer();
        bottomBarContainer && bottomBarContainer.remove();

        const imageViewerBox = getImageViewerContainer();
        imageViewerBox.classList.add('fade-out');

        setTimeout(function () {
            imageViewerBox && imageViewerBox.remove();
        }, 200);

        toggleLockBodyScroll();
    }

    function openImageViewer(e) {
        toggleLockBodyScroll();
        pauseYoutubeVideos();

        createElement({ className: 'popup-image-box', parent: body });
        addImageViwerKeyEvent();
        moveToNextImage();
        setActiveImage(e.target.parentNode.dataset.imageIndex);
    }

    function moveToNextImage() {
        const imageViewerBox = getImageViewerContainer();
        const activeImageIndex = getActiveImageIndex();

        cleanUpPrevImageViewerEvents();

        const bottomBars = document.querySelectorAll('.bar-container .bar');

        if (!bottomBars.length && imageBoxes.length > 1) {
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

    // events
    function imageViewerKeyEvent(e) {
        const activeImageIndex = getActiveImageIndex();

        switch (e.keyCode) {
            case 37:
            case 38: // prev
                setActiveImage(
                    activeImageIndex
                        ? activeImageIndex - 1
                        : imageBoxes.length - 1,
                );
                return moveToNextImage();
            case 32:
            case 39:
            case 40: // next
                setActiveImage((activeImageIndex + 1) % imageBoxes.length);
                return moveToNextImage();
            case 81:
            case 27: // close
                return closeImageViewer();
        }
    }

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

        document.removeEventListener('keydown', imageViewerKeyEvent);
        imageViewerBox.removeEventListener('mousemove', fadeInBottomBars);
    }

    function addImageViwerKeyEvent() {
        document.addEventListener('keydown', imageViewerKeyEvent);
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

    addImageBoxesEventListeners();
})();
