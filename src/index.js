#!/usr/bin/env node

const clien = require('./cli/CLIClien');

(async () => {
    await clien.start();
})();
