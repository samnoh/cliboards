const defaultConstants = require('../defaultConstants');

const baseUrl = 'https://m.dcinside.com';

const boardTypes = [
    '1 페이지',
    '2 페이지',
    '3 페이지',
    '흥한 갤러리',
    '흥한 마이너 갤러리',
];

module.exports = {
    ...defaultConstants,
    baseUrl,
    getUrl: (board, filter = '') => `${baseUrl}/board/${board}?${filter}&page=`,
    boardTypes,
    boards: [
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
        {
            name: '프로그래밍',
            value: 'programming',
            type: boardTypes[0],
        },
    ],
    search: {
        getSearchParams: (type, keyword) => `&s_type=${type}&serval=${keyword}`,
        types: [
            {
                name: '전체',
                value: 'all',
            },
            {
                name: '제목',
                value: 'subject',
            },
            {
                name: '내용',
                value: 'memo',
            },
            {
                name: '글쓴이',
                value: 'name',
            },
            {
                name: '제목+내용',
                value: 'subject_m',
            },
        ],
    },
    filterOptions: {
        activeFilterIndex: 0,
        filters: [
            {
                name: '전체',
                value: '',
            },
            {
                name: '개념글',
                value: 'recommend=1',
            },
        ],
    },
};
