const Configstore = require('configstore');

const { name } = require('../../package.json');

const configstore = new Configstore(name, null);

const resetConfigstore = () => configstore.clear();

module.exports = { configstore, resetConfigstore };
