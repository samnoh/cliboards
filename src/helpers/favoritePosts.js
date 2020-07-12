const { configstore } = require('./configstore');

const globalKey = 'favoritePosts';

const getConfigKey = crawler => `${globalKey}.${crawler}`;

const initFavoriteConfig = crawler => {
    const key = getConfigKey(crawler);
    if (!configstore.has(key)) {
        configstore.set(key, []);
    }
};

const clearAllFavorites = () => {
    configstore.delete(globalKey);
};

const clearFavorites = crawler => {
    configstore.delete(getConfigKey(crawler));
};

const setFavorite = (crawler, boardType, post) => {
    const key = getConfigKey(crawler);
    const favs = configstore.get(key);

    const newData = {
        crawler,
        boardType,
        title: post.title,
        link: post.link,
        author: post.author,
        id: post.id,
    };

    configstore.set(key, [...favs, newData]);
};

const getFavorites = crawler => {
    return configstore.get(getConfigKey(crawler) || globalKey);
};

const getFavoritesById = (crawler, id) => {
    initFavoriteConfig(crawler);
    return configstore.get(getConfigKey(crawler)).find(p => p.id === id);
};

const deleteFavoritesById = (crawler, id) => {
    const key = getConfigKey(crawler);
    const newData = configstore.get(key).filter(p => p.id !== id);
    configstore.set(key, newData);
};

// clearAllFavorites();

module.exports = {
    clearAllFavorites,
    clearFavorites,
    setFavorite,
    getFavorites,
    getFavoritesById,
    deleteFavoritesById,
};
