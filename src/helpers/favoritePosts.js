const { configstore } = require('./configstore');

const globalKey = 'favoritePosts';

const getConfigKey = crawler => `${globalKey}.${crawler}`;

const initFavoriteConfig = crawler => {
    const key = getConfigKey(crawler);
    if (!configstore.has(key)) {
        configstore.set(key, []);
    }
};

const clearFavorites = crawler => {
    configstore.delete(crawler ? getConfigKey(crawler) : globalKey);
};

const setFavorite = (crawler, boardType, post) => {
    const key = getConfigKey(crawler);
    const favs = configstore.get(key);

    const newData = {
        category: `${boardType.name}`,
        title: post.title,
        link: post.link,
        author: post.author,
        id: post.id,
        timestamp: new Date().getTime(),
    };

    configstore.set(key, [...favs, newData]);
};

const getFavorites = crawler => {
    initFavoriteConfig(crawler);
    return configstore.get(crawler ? getConfigKey(crawler) : globalKey);
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

const deleteFavoritesByIndex = (crawler, index) => {
    const key = getConfigKey(crawler);
    const newData = configstore.get(key);
    newData.splice(index, 1);
    configstore.set(key, newData);
};

// clearFavorites();

module.exports = {
    clearFavorites,
    setFavorite,
    getFavorites,
    getFavoritesById,
    deleteFavoritesById,
    deleteFavoritesByIndex,
};
