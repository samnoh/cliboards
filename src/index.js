#!/usr/bin/env node

const clien = require('./boards/Clien');

(async () => {
    await clien.start();
})();
