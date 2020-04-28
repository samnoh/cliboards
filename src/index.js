#!/usr/bin/env node

const prompt = require('./lib/prompt');

(async () => {
    await prompt.init();
})();
