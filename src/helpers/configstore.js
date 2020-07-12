const Configstore = require('configstore');

const { name } = require('../../package.json');

const isDevMode = process.env.NODE_ENV === 'development';

const configstore = new Configstore(`${name}${isDevMode ? '/dev' : ''}`, null);

const resetConfigstore = () => configstore.clear();

module.exports = { configstore, resetConfigstore };
