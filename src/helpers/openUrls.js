const open = require('open');

module.exports = async urls => {
    if (!urls) return;

    try {
        if (Array.isArray(urls)) {
            urls.map(async url => {
                await open(url, { url: true });
            });
        } else {
            await open(urls);
        }
    } catch (e) {
        throw new Error(e);
    }
};
