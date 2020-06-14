const updateNotifier = require('./updateNotifier');
const { configstore, resetConfigstore } = require('./configstore');
const { getTheme, resetCustomTheme, customThemeFilePath } = require('./theme');
const openUrls = require('./openUrls');

module.exports = {
    updateNotifier,
    configstore,
    resetConfigstore,
    getTheme,
    resetCustomTheme,
    customThemeFilePath,
    openUrls
};
