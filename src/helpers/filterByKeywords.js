const fs = require('fs');
const path = require('path');

const { openUrls } = require('./openFiles');

const filterKeywordsFilePath = path.resolve(__dirname, 'filter_keywords.txt');

const openFilterKeywordsFile = async () => {
    await openUrls(filterKeywordsFilePath);
};

const readFilterKeywordsFile = () => {
    try {
        return fs
            .readFileSync(filterKeywordsFilePath, {
                encoding: 'utf-8',
            })
            .split('\n')
            .filter(text => {
                if (!text || text[0] === '!' || text[0] === '#') return false;
                return true;
            });
    } catch (e) {
        fs.writeFileSync(filterKeywordsFilePath, '');
        return [];
    }
};

let keywords = readFilterKeywordsFile();

const getKeywords = () => {
    return keywords;
};

const filterByKeywords = targets => {
    if (!targets || !targets.length || !keywords.length) {
        return targets;
    }

    return targets.filter(target => {
        for (let i = 0; i < keywords.length; i++) {
            if (target.includes(keywords[i])) return false;
        }

        return true;
    });
};

console.log(getKeywords());

module.exports = {
    openFilterKeywordsFile,
    getKeywords,
    filterByKeywords,
};
