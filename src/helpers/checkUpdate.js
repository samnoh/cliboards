const updateNotifier = require('update-notifier');

const pkg = require('../../package.json');

const notifier = updateNotifier({
    pkg,
    updateCheckInterval: 1,
    shouldNotifyInNpmScript: true,
});

module.exports = () => {
    if (notifier.update) {
        notifier.notify({
            isGlobal: true,
            defer: false,
        });
    }
};
