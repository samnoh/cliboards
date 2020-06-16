(function () {
    const body = document.querySelector('body');
    const imageBoxes = body.querySelectorAll('img, video');

    let zoomedImageIndex = 0;

    function toggleLockScroll() {
        body.style.overflowY =
            body.style.overflowY === 'hidden' ? 'auto' : 'hidden';
    }

    function setImageSrc(imageEl) {
        const nextImage = imageBoxes[zoomedImageIndex];
        let src = nextImage.src;

        if (nextImage.tagName === 'VIDEO') {
            src = nextImage.querySelector('source').src;
        }

        imageEl.src = src;
    }

    function nextImage(e) {
        const imageEl = document
            .querySelector('.popup-image-box')
            .querySelector('img, video');

        switch (e.keyCode) {
            case 37:
            case 38: // prev
                zoomedImageIndex = zoomedImageIndex
                    ? zoomedImageIndex - 1
                    : imageBoxes.length - 1;
                setImageSrc(imageEl);
                return;
            case 32:
            case 39:
            case 40: // next
                zoomedImageIndex = (zoomedImageIndex + 1) % imageBoxes.length;
                setImageSrc(imageEl);
                return;
            case 81:
            case 27:
                closePopupImage(document.querySelector('.popup-image-box'));
                return;
        }
    }

    function closePopupImage() {
        const popupBox = document.querySelector('.popup-image-box');
        document.removeEventListener('keydown', nextImage);
        popupBox.remove();
        toggleLockScroll();
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

        document.addEventListener('keydown', nextImage);
        imageEl.addEventListener('click', closePopupImage);
    }

    imageBoxes.forEach(box => {
        box.addEventListener('click', openPopupImage);
    });
})();
