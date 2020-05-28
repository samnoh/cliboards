const baseUrl = 'https://m.dcinside.com';

const boardTypes = ['갤러리', '마이너 갤러리'];

module.exports = {
    baseUrl,
    getUrl: ({ value }) => `${baseUrl}/board/${value}?page=`,
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
            name: '인간수업',
            value: 'sooup',
            type: boardTypes[0],
        },
        {
            name: '궨트',
            value: 'gwent',
            type: boardTypes[1],
        },
        {
            name: '모여봐요 동물의 숲',
            value: 'acnewhorizons',
            type: boardTypes[1],
        },
        {
            name: '배우 박주현',
            value: 'juhyunpark',
            type: boardTypes[1],
        },
    ],
};
