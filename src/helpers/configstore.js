const Configstore = require('configstore');

const pagkageJson = require('../../package.json');

const config = new Configstore(pagkageJson.name, null);

module.exports = config;
