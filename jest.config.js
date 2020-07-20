const path = require('path');

module.exports = {
    setupFiles: [path.join(__dirname, 'test', 'helpers', 'setup.js')],
    verbose: false,
    testEnvironment: 'node',
};
