const fs = require('fs');
const path = require('path');

const { openUrls, clearFile } = require('../openFiles');

const filterByKeywordsFilePath = path.resolve(
    __dirname,
    'filtersByKeywords.txt',
);

const openFilterByKeywordsFile = async () => {
    await openUrls(filterByKeywordsFilePath);
};

const resetFilterByKeywordsFile = () => {
    clearFile(
        filterByKeywordsFilePath,
        '# 글 목록에서 필터링하고 싶은 키워드를 한줄에 한개씩 입력하세요. 키워드 첫글자에 #을 입력하면 생략됩니다.\n',
    );
};

const readFilterKeywordsFile = () => {
    try {
        return fs
            .readFileSync(filterByKeywordsFilePath, { encoding: 'utf-8' })
            .split('\n')
            .filter(text => {
                if (!text || text[0] === '#') return false;
                return true;
            });
    } catch (e) {
        fs.writeFileSync(filterByKeywordsFilePath, '');
        return [];
    }
};

let keywords = readFilterKeywordsFile();

const getKeywords = () => {
    return keywords;
};

const filterByKeywords = target => {
    if (!target || !keywords.length) return target;

    for (let i = 0; i < keywords.length; i++) {
        if (target.includes(keywords[i])) return false;
    }
    return true;
};

module.exports = {
    openFilterByKeywordsFile,
    resetFilterByKeywordsFile,
    getKeywords,
    filterByKeywords,
};
