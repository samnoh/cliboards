(function () {
    const body = document.querySelector('body');
    const imageBoxes = body.querySelectorAll('img, video');

    let zoomedImageIndex = 0;

    function toggleLockScroll() {
        body.style.overflowY =
            body.style.overflowY === 'hidden' ? 'auto' : 'hidden';
    }

    function closePopupImage() {
        const popupBox = document.querySelector('.popup-image-box');
        document.removeEventListener('keydown', popupImageKeyEvent);
        popupBox.remove();
        toggleLockScroll();
    }

    function changeToNextImage(popupImageBox) {
        const imageEl = popupImageBox.querySelector('img, video');
        const nameEl = popupImageBox.querySelector('.name');

        const nextImageEl = imageBoxes[zoomedImageIndex];
        const nextNameEl = nextImageEl.parentNode.querySelector('.name');

        if (nextImageEl.tagName === 'VIDEO') {
            imageEl.src = nextImageEl.querySelector('source').src;
        } else {
            imageEl.src = nextImageEl.src;
        }

        nameEl.innerText = nextNameEl.innerText;
    }

    function popupImageKeyEvent(e) {
        const popupImageBox = document.querySelector('.popup-image-box');

        switch (e.keyCode) {
            case 37:
            case 38: // prev
                zoomedImageIndex = zoomedImageIndex
                    ? zoomedImageIndex - 1
                    : imageBoxes.length - 1;
                return changeToNextImage(popupImageBox);
            case 32:
            case 39:
            case 40: // next
                zoomedImageIndex = (zoomedImageIndex + 1) % imageBoxes.length;
                return changeToNextImage(popupImageBox);
            case 81:
            case 27: // close
                return closePopupImage(popupImageBox);
        }
    }

    function openPopupImage({ target }) {
        toggleLockScroll();

        const popupBox = document.createElement('div');
        const imageBox = target.parentNode.cloneNode(true);
        const imageEl = imageBox.querySelector('img, video');

        zoomedImageIndex = parseInt(imageBox.dataset.image);

        popupBox.classList.add('popup-image-box');

        body.appendChild(popupBox);
        popupBox.appendChild(imageBox);

        document.addEventListener('keydown', popupImageKeyEvent);
        imageEl.addEventListener('click', closePopupImage);
    }

    imageBoxes.forEach(box => {
        box.addEventListener('click', openPopupImage);
    });
})();
