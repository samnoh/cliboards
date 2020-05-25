#!/usr/bin/env node
const updateNotifier = require('update-notifier');

const package = require('../package.json');
const Community = require('./cli/Community');

const notifier = updateNotifier({
    pkg: package,
    // updateCheckInterval: 1000 * 60 * 60 * 24 * 7,
});

notifier.update ? notifier.notify() : Community.start();
