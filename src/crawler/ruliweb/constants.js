const defaultConstants = require('../defaultConstants');

const baseUrl = 'https://bbs.ruliweb.com';

const boardTypes = ['PS4/5', 'SWITCH', 'XBO/SX', 'PC', '취미갤'];

module.exports = {
    ...defaultConstants,
    baseUrl,
    commentsUrl: 'https://api.ruliweb.com/commentView',
    getUrl: board => `${baseUrl}${board}?page=`,
    boardTypes,
    boards: [
        {
            name: '유저 정보',
            value: '/ps/board/300001',
            type: boardTypes[0],
        },
        {
            name: '게임 이야기',
            value: `/ps/board/300421`,
            type: boardTypes[0],
        },
        {
            name: '유저 정보',
            value: '/nin/board/300004',
            type: boardTypes[1],
        },
        {
            name: '게임 이야기',
            value: '/nin/board/300051',
            type: boardTypes[1],
        },
        {
            name: '유저 정보',
            value: '/xbox/board/300003',
            type: boardTypes[2],
        },
        {
            name: '게임 이야기',
            value: '/xbox/board/300047',
            type: boardTypes[2],
        },
        {
            name: 'PC 정보',
            value: '/pc/board/300006',
            type: boardTypes[3],
        },
        {
            name: 'PC 게임 정보',
            value: '/pc/board/300007',
            type: boardTypes[3],
        },
        {
            name: '영상기기 갤러리',
            value: '/hobby/board/320033',
            type: boardTypes[4],
        },
    ],
    search: {
        getSearchParams: (type, keyword) =>
            `&search_type=${type}&search_key=${keyword}`,
        types: [
            {
                name: '제목',
                value: 'subject',
            },
            {
                name: '본문',
                value: 'content',
            },
            {
                name: '제목+본문',
                value: 'subject_content',
            },
            {
                name: '글쓴이',
                value: 'name',
            },
        ],
    },
};
