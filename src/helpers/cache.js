const { configstore } = require('./configstore');

const cache = Object.create(null);

/*
options
{
    ttl: number, (ms)
}
*/

// deep-freeze on npm
const deepFreeze = obj => {
    Object.freeze(obj);

    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (
            obj.hasOwnProperty(prop) &&
            obj[prop] !== null &&
            (typeof obj[prop] === 'object' ||
                typeof obj[prop] === 'function') &&
            !Object.isFrozen(obj[prop])
        ) {
            deepFreeze(obj[prop]);
        }
    });

    return obj;
};

const setCacheData = (key, value, options = {}) => {
    let isNewData = false;

    if (!key || key === '*' || !value) return isNewData;

    const _value = {};

    Object.defineProperties(_value, {
        data: {
            value,
            enumerable: true,
        },
        createdAt: {
            value: options.createdAt || new Date().getTime(),
            enumerable: true,
        },
        ttl: {
            value: options.ttl,
            enumerable: true,
        },
    });

    if (cache[key]) {
        isNewData = deleteCacheData(key);
    }

    if (options.save) {
        configstore.set(`cache.${key}`, _value);
    }

    // can delete but not able to update data
    Object.defineProperty(cache, key, {
        value: deepFreeze(_value),
        enumerable: true,
        configurable: true,
    });

    return isNewData;
};

const getCacheData = key => {
    // get all cache data
    if (key === '*') {
        const keys = Object.keys(cache);
        return keys.map(_key => ({ [key]: cache[_key].data }));
    }

    if (!cache[key] && configstore.has(`cache.${key}`)) {
        const value = configstore.get(`cache.${key}`);

        setCacheData(key, value.data, {
            ttl: value.ttl,
            createdAt: value.createdAt,
        });
    }

    return (clearOldData(key) || {}).data;
};

const hasCacheData = key => {
    if (getCacheData(key)) {
        return true;
    }
    return false;
};

const deleteCacheData = key => {
    // delete all cache data
    if (key === '*') {
        const keys = Object.keys(cache);

        if (keys.length) {
            keys.forEach(_key => {
                clearSavedCacheData(_key);
                delete cache[_key];
            });

            return true;
        }
    } else if (getCacheData(key)) {
        clearSavedCacheData(key);
        delete cache[key];
        return true;
    }
    return false;
};

const clearOldData = key => {
    const value = cache[key];

    if (value && typeof value.ttl === 'number') {
        const now = new Date().getTime();

        if (now - (value.ttl + value.createdAt) > 0) {
            delete cache[key];
            return null;
        }
    }

    return value;
};

const clearSavedCacheData = key => {
    if (configstore.has(`cache.${key}`)) {
        configstore.delete(`cache.${key}`);
        return true;
    }
    return false;
};

module.exports = {
    getCacheData,
    setCacheData,
    hasCacheData,
};
