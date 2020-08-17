'use strict';

const body = document.querySelector('body');

function toggleLockBodyScroll() {
    body.style.overflowY =
        body.style.overflowY === 'hidden' ? 'auto' : 'hidden';
}

function pauseYoutubeVideos(query) {
    const youtubeVideos = body.querySelectorAll(query);

    if (!youtubeVideos.length) return;

    const message = {
        event: 'command',
        func: 'pauseVideo',
        args: '',
    };

    youtubeVideos.forEach(video => {
        video.contentWindow.postMessage(JSON.stringify(message), '*');
    });
}

function createElement({ type, className, parent, attr }) {
    const elem = document.createElement(type || 'div');

    if (className) {
        if (Array.isArray(className)) elem.classList.add(...className);
        else elem.classList.add(className);
    }

    if (parent) {
        parent.appendChild(elem);
    }

    if (attr) {
        Object.keys(attr).forEach(key => {
            const value = attr[key];
            setNestedProperty(elem, key, value);
        });
    }

    return elem;
}

function setNestedProperty(obj, key, value) {
    key = key.split('.');

    while (key.length > 1) {
        obj = obj[key.shift()];
    }

    obj[key.shift()] = value;
}

function debounce(f, delay) {
    let isCooldown = false;

    return function () {
        if (isCooldown) return;

        f.apply(this, arguments);

        isCooldown = true;

        setTimeout(() => {
            isCooldown = false;
        }, delay);
    };
}
