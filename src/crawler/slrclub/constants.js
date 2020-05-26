const baseUrl = 'http://www.slrclub.com';

const boardTypes = ['커뮤니티'];

module.exports = {
    baseUrl,
    getUrl: (boardName) => `${baseUrl}/bbs/zboard.php?id=${boardName}&page=`,
    sortUrls: [],
    boardTypes,
    ignoreBoards: [],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset'],
    boards: [
        {
            name: '자유게시판',
            value: 'free',
            type: boardTypes[0],
        },
    ],
};
