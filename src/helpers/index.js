const updateNotifier = require('./updateNotifier');
const { configstore, resetConfigstore } = require('./configstore');
const env = require('./env');
const { getYoutubeVideoId, hasSpoilerWord } = require('./string');
const { getTheme, resetCustomTheme, openCustomThemeFile } = require('./theme');
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
} = require('./postFavorites');
const {
    clearHistory,
    setHistory,
    isInPostHistory,
    getCurrentHistories,
} = require('./postHistories');
const {
    openFilterKeywordsFile,
    filterByKeywords,
} = require('./filterByKeywords');

module.exports = {
    env,
    updateNotifier,
    configstore,
    resetConfigstore,
    getYoutubeVideoId,
    hasSpoilerWord,
    getTheme,
    resetCustomTheme,
    openCustomThemeFile,
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
    openFilterKeywordsFile,
    filterByKeywords,
};
