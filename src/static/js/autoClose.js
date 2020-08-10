'use strict';

(() => {
    const autoCloseInput = document.querySelector('#auto-close');

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
        history.scrollRestoration = 'manual';
        isReloaded = true;
    });

    autoCloseInput.addEventListener('change', function ({ target }) {
        updateAutoCloseEventListener(target.checked);
    });

    updateAutoCloseEventListener(true);
})();
