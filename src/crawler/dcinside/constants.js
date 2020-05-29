const baseUrl = 'https://m.dcinside.com';

const boardTypes = ['1 페이지', '2 페이지', '3 페이지'];

module.exports = {
    baseUrl,
    getUrl: (board) => `${baseUrl}/board/${board}?page=`,
    sortUrls: [],
    boardTypes,
    ignoreBoards: [],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset', 'script'],
    boards: [
        {
            name: '인터넷방송',
            value: 'ib_new1',
            type: boardTypes[0],
        },
        {
            name: '국내야구',
            value: 'baseball_new8',
            type: boardTypes[0],
        },
        {
            name: '궨트',
            value: 'gwent',
            type: boardTypes[0],
        },
        {
            name: '배우 박주현',
            value: 'juhyunpark',
            type: boardTypes[0],
        },
    ],
};
