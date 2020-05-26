const baseUrl = 'http://www.slrclub.com';

module.exports = {
    baseUrl,
    getUrl: (boardName) => `${baseUrl}/bbs/zboard.php?id=${boardName}&page=`,
    sortUrls: [],
    boardTypes: ['커뮤니티'],
    ignoreBoards: [],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset'],
    boards: [
        {
            name: '자유게시판',
            value: 'free',
            type: '커뮤니티',
        },
    ],
};
