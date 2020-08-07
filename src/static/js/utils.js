'use strict';

const body = document.querySelector('body');

function toggleLockBodyScroll() {
    body.style.overflowY =
        body.style.overflowY === 'hidden' ? 'auto' : 'hidden';
}

function pauseYoutubeVideos() {
    const youtubeVideos = body.querySelectorAll('.youtube-video');

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

function setObject(obj, str, val) {
    str = str.split('.');
    while (str.length > 1) obj = obj[str.shift()];
    return (obj[str.shift()] = val);
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
            setObject(elem, key, attr[key]);
        });
    }

    return elem;
}
