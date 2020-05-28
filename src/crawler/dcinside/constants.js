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
            name: '인간수업',
            value: 'sooup',
            type: boardTypes[0],
        },
        {
            name: '궨트',
            value: 'gwent',
            type: boardTypes[1],
        },
    ],
};
