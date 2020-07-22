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

const tempFolderPath = path.resolve(__dirname, '..', '..', '.temp');
const tempHtmlPath = path.join(tempFolderPath, 'index.html');

const openImages = async props => {
    const html = renderHtml(props);

    fs.writeFileSync(tempHtmlPath, html);

    await open(tempHtmlPath, { wait: true });
};

const clearFolder = folderPath => {
    try {
        const exists = fs.existsSync(folderPath);

        exists && fs.rmdirSync(folderPath, { recursive: true });
        fs.mkdirSync(folderPath, { recursive: true });
    } catch (e) {}
};

const clearFile = (filePath, content) => {
    try {
        fs.unlinkSync(filePath);
        content && fs.writeFileSync(filePath, content);
    } catch (e) {}
};

module.exports = {
    openUrls,
    openImages,
    clearFolder,
    clearFile,
    tempFolderPath,
};
