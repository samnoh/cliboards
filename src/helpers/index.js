const updateNotifier = require('./updateNotifier');
const { configstore, resetConfigstore } = require('./configstore');
const { getYoutubeVideoId, hasSpoilerWord } = require('./string');
const { getTheme, resetCustomTheme, customThemeFilePath } = require('./theme');
const {
    openUrls,
    openImages,
    clearFolder,
    tempFolderPath,
} = require('./openFiles');
const {
    clearFavorites,
    setFavorite,
    getFavorites,
    getFavoriteById,
    deleteFavoritesById,
    deleteFavoritesByIndex,
} = require('./favoritePosts');
const {
    clearHistory,
    setHistory,
    isInPostHistory,
    getCurrentHistories,
} = require('./postHistories');

module.exports = {
    updateNotifier,
    configstore,
    resetConfigstore,
    getYoutubeVideoId,
    hasSpoilerWord,
    getTheme,
    resetCustomTheme,
    customThemeFilePath,
    openUrls,
    openImages,
    clearFolder,
    tempFolderPath,
    clearFavorites,
    setFavorite,
    getFavorites,
    getFavoriteById,
    deleteFavoritesById,
    deleteFavoritesByIndex,
    clearHistory,
    setHistory,
    isInPostHistory,
    getCurrentHistories,
};
