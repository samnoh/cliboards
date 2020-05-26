const updateNotifier = require('update-notifier');

const pkg = require('../../package.json');

const notifier = updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60,
    shouldNotifyInNpmScript: true,
});

module.exports = () => {
    if (notifier.update) {
        notifier.notify({
            message: 'Run `{updateCommand}` to update.',
            isGlobal: true,
            defer: false,
        });
    }
};
