const defaultConstants = require('../defaultConstants');

const baseUrl = 'http://m.slrclub.com';

const boardTypes = ['커뮤니티', '포럼'];

module.exports = {
    ...defaultConstants,
    baseUrl,
    commentsUrl: `${baseUrl}/bbs/comment_db/load.php`,
    getUrl: boardName => `${baseUrl}/l/${boardName}/`,
    boardTypes,
    boards: [
        {
            name: '자유게시판',
            value: 'free',
            type: boardTypes[0],
        },
        {
            name: 'Canon',
            value: 'canon_d30_forum',
            type: boardTypes[1],
        },
        {
            name: 'Leica',
            value: 'leica_forum',
            type: boardTypes[1],
        },
        {
            name: 'Nikon',
            value: 'nikon_d1_forum',
            type: boardTypes[1],
        },
        {
            name: 'Sony/Minolta',
            value: 'minolta_forum',
            type: boardTypes[1],
        },
    ],
};
