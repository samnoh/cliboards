const updateNotifier = require('update-notifier');

const pkg = require('../../package.json');

const notifier = updateNotifier({
    pkg,
    updateCheckInterval: 1,
    shouldNotifyInNpmScript: true
});

const notifyUpdate = () => {
    if (notifier.update) {
        notifier.notify({ isGlobal: true, defer: false });
    }
};

module.exports = { notifyUpdate };
