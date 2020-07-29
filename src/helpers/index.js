const env = require('./env');
const updateNotifier = require('./updateNotifier');
const { configstore, resetConfigstore } = require('./configstore');
const { getYoutubeVideoId, hasSpoilerWord, pluralize } = require('./string');
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
    openFilterByKeywordsFile,
    resetFilterByKeywordsFile,
    filterByKeywords,
} = require('./filterByKeywords');
const { getCacheData, setCacheData, hasCacheData } = require('./cache');

module.exports = {
    env,
    updateNotifier,
    configstore,
    resetConfigstore,
    getYoutubeVideoId,
    hasSpoilerWord,
    pluralize,
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
    openFilterByKeywordsFile,
    resetFilterByKeywordsFile,
    filterByKeywords,
    getCacheData,
    setCacheData,
    hasCacheData,
};
