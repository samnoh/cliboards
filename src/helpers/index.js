const updateNotifier = require('./updateNotifier');
const { configstore, resetConfigstore } = require('./configstore');
const { getYoutubeVideoId } = require('./string');
const { getTheme, resetCustomTheme, customThemeFilePath } = require('./theme');
const {
    openUrls,
    openImages,
    clearFolder,
    tempFolderPath,
} = require('./openFiles');

module.exports = {
    updateNotifier,
    configstore,
    resetConfigstore,
    getYoutubeVideoId,
    getTheme,
    resetCustomTheme,
    customThemeFilePath,
    openUrls,
    openImages,
    clearFolder,
    tempFolderPath,
};
