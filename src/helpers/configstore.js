const Configstore = require('configstore');

const { isDevEnv } = require('./env');
const { name } = require('../../package.json');

const configstore = new Configstore(`${name}${isDevEnv ? '/dev' : ''}`, null);

const resetConfigstore = () => configstore.clear();

module.exports = { configstore, resetConfigstore };
