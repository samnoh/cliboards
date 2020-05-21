module.exports = {
    baseUrl: 'http://www.slrclub.com',
    getUrl: (boardName) => `http://www.slrclub.com/bbs/zboard.php?id=${boardName}&page=`,
    sortUrls: [],
    boardTypes: ['커뮤니티'],
    ignoreBoards: [],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset'],
};
