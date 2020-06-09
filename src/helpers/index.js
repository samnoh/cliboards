const updateNotifier = require('./updateNotifier');
const { configstore, resetConfigstore } = require('./configstore');
const { getTheme, resetCustomTheme } = require('./getTheme');
const openUrls = require('./openUrls');

module.exports = {
    updateNotifier,
    configstore,
    resetConfigstore,
    getTheme,
    resetCustomTheme,
    openUrls,
};
