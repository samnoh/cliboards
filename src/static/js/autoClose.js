'use strict';

(() => {
    const isAutoClose = localStorage.getItem('isAutoClose');
    const autoCloseInput = document.querySelector('#auto-close');

    if (!isAutoClose === 'true' && !isAutoClose === null) {
        autoCloseInput.checked = false;
    }

    let isReloaded = false;

    function autoClose() {
        if (
            !isReloaded &&
            (document.hidden || document.webkitHidden || document.msHidden)
        ) {
            window.close();
        }
    }

    function updateAutoCloseEventListener(isAdd) {
        document[isAdd ? 'addEventListener' : 'removeEventListener'](
            'visibilitychange',
            autoClose,
        );
    }

    window.addEventListener('beforeunload', function (e) {
        localStorage.setItem('isAutoClose', autoCloseInput.checked);
        history.scrollRestoration = 'manual';
        isReloaded = true;
    });

    autoCloseInput.addEventListener('change', function ({ target }) {
        updateAutoCloseEventListener(target.checked);
    });

    updateAutoCloseEventListener(true);
})();
