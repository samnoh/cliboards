#!/usr/bin/env node

const Community = require('./cli/Community');
const parseArgs = require('minimist')(process.argv.slice(2));

(async () => {
    await Community.start({
        startCrawler: parseArgs._[0],
        ...parseArgs
    });
})();
