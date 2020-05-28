const Configstore = require('configstore');

const { name } = require('../../package.json');

const config = new Configstore(name, null);

module.exports = config;
