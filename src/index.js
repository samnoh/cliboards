#!/usr/bin/env node

const prompt = require('./lib/prompt');

const init = async () => {
    await prompt.init();
};

init();
