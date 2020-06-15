const fs = require('fs');
const path = require('path');

const open = require('open');

const renderHtml = require('./renderHtml');

const openUrls = async urls => {
    if (!urls) return;

    try {
        if (Array.isArray(urls)) {
            return urls.forEach(async url => {
                await openUrls(url);
            });
        }
        await open(urls, { wait: true });
    } catch (e) {}
};

const openImages = async props => {
    const tempFolderPath = path.resolve(__dirname, '..', '..', 'temp');
    const tempHtmlPath = path.resolve(tempFolderPath, 'temp.html');

    const html = renderHtml(props);

    fs.writeFileSync(tempHtmlPath, html);

    await open(tempHtmlPath, { wait: true });
};

module.exports = { openUrls, openImages };
