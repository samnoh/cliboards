const baseUrl = 'https://m.dcinside.com';

const boardTypes = ['1 페이지', '2 페이지', '3 페이지'];

module.exports = {
    baseUrl,
    getUrl: board => `${baseUrl}/board/${board}?page=`,
    sortUrls: [],
    boardTypes,
    ignoreBoards: [],
    ignoreRequests: [
        'image',
        'stylesheet',
        'media',
        'font',
        'imageset',
        'script',
    ],
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
};
