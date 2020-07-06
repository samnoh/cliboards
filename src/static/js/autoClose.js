'use strict';

(() => {
    const autoCloseInput = document.querySelector('#auto-close');

    function autoClose() {
        if (document.hidden || document.webkitHidden || document.msHidden) {
            window.close();
        }
    }

    autoCloseInput.addEventListener('change', ({ target }) => {
        if (target.checked) {
            localStorage.setItem('auto-close', true);
            document.addEventListener('visibilitychange', autoClose, false);
        } else {
            localStorage.setItem('auto-close', false);
            document.removeEventListener('visibilitychange', autoClose);
        }
    });

    document.addEventListener('visibilitychange', autoClose, false);
})();
