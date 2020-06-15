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

const tempFolderPath = path.resolve(__dirname, '..', '..', 'temp');

const openImages = async props => {
    const tempHtmlPath = path.join(tempFolderPath, 'index.html');

    const html = renderHtml(props);

    fs.writeFileSync(tempHtmlPath, html);

    await open(tempHtmlPath, { wait: true });
};

const clearFolder = folderPath => {
    const exists = fs.existsSync(folderPath);

    if (exists) {
        fs.readdir(folderPath, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(folderPath, file), err => {
                    if (err) throw err;
                });
            }
        });
    } else {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

module.exports = { openUrls, openImages, clearFolder, tempFolderPath };
