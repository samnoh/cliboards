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
    getFavoritesById,
    deleteFavoritesById,
    deleteFavoritesByIndex,
} = require('./favoritePosts');

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
    getFavoritesById,
    deleteFavoritesById,
    deleteFavoritesByIndex,
};
