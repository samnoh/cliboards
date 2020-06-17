(function () {
    const body = document.querySelector('body');
    const imageBoxes = body.querySelectorAll('img, video');

    let zoomedImageIndex = 0;

    function toggleLockBodyScroll() {
        body.style.overflowY =
            body.style.overflowY === 'hidden' ? 'auto' : 'hidden';
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
        document.removeEventListener('keydown', popupImageKeyEvent);

        const popupImageBox = document.querySelector('.popup-image-box');
        popupImageBox.classList.add('fade-out');
        setTimeout(function () {
            popupImageBox.remove();
        }, 200);

        toggleLockBodyScroll();
    }

    function moveToNextImage() {
        const popupImageBox = document.querySelector('.popup-image-box');
        popupImageBox.childNodes.forEach(function (c) {
            c.removeEventListener('click', closePopupImage);
            c.remove();
        });

        const nextImageEl = imageBoxes[zoomedImageIndex];
        const imageBox = nextImageEl.parentNode.cloneNode(true);
        const imageEl = imageBox.querySelector('img, video');

        popupImageBox.appendChild(imageBox);
        imageEl.addEventListener('click', closePopupImage);
    }

    function openPopupImage(e) {
        toggleLockBodyScroll();

        document.addEventListener('keydown', popupImageKeyEvent);

        zoomedImageIndex = parseInt(e.target.parentNode.dataset.image);

        const popupImageBox = document.createElement('div');
        popupImageBox.classList.add('popup-image-box');
        body.appendChild(popupImageBox);

        moveToNextImage(popupImageBox);
    }

    imageBoxes.forEach(function (box) {
        box.addEventListener('click', openPopupImage);
    });
})();
