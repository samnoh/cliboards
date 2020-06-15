#!/usr/bin/env node

const parseArgs = require('minimist')(process.argv.slice(2));

const Community = require('./cli/Community');

(async () => {
    await Community.start({ startCrawler: parseArgs._[0], ...parseArgs });
})();
