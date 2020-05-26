#!/usr/bin/env node
const updateNotifier = require('update-notifier');

const pkg = require('../package.json');
const Community = require('./cli/Community');

const notifier = updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 10,
    shouldNotifyInNpmScript: true,
});

notifier.update
    ? notifier.notify({ message: 'Run `{updateCommand}` to update.', isGlobal: true })
    : Community.start();
