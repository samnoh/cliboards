const baseUrl = 'http://m.ppomppu.co.kr';

const boardTypes = ['커뮤니티', '뽐뿌'];

module.exports = {
    baseUrl,
    getUrl: (board, page, sort) => {
        return `${baseUrl}/new/${sort}.php?id=${board}&page=${page}&bot_type=${sort}`;
    },
    boardTypes,
    sortUrls: [
        {
            value: 'bbs_list',
            name: '최신',
        },
        {
            value: 'pop_bbs',
            name: '인기',
        },
        {
            value: 'hot_bbs',
            name: 'HOT게시글',
        },
    ],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset', 'script'],
    boards: [
        {
            value: 'freeboard',
            name: '자유게시판',
            type: boardTypes[0],
        },
        {
            value: 'issue',
            name: '정치자유게시판',
            type: boardTypes[0],
        },
        {
            value: 'humor',
            name: '유머/감동',
            type: boardTypes[0],
        },
        {
            value: 'help',
            name: '질문/요청',
            type: boardTypes[0],
        },
        {
            value: 'grade',
            name: '자기소개',
            type: boardTypes[0],
        },
        {
            value: 'campaign',
            name: '뽐뿌캠페인',
            type: boardTypes[0],
        },
        {
            value: 'ppomppu',
            name: '뽐뿌게시판',
            type: boardTypes[1],
        },
        {
            value: 'ppomppu2',
            name: '휴대폰뽐뿌',
            type: boardTypes[1],
        },
        {
            value: 'ppomppu4',
            name: '해외뽐뿌',
            type: boardTypes[1],
        },
        {
            value: 'pmarket',
            name: 'MD뽐뿌',
            type: boardTypes[1],
        },
        {
            value: 'ppomppu5',
            name: '오프라인뽐뿌',
            type: boardTypes[1],
        },
        {
            value: 'ppomppu7',
            name: '뷰티뽐뿌',
            type: boardTypes[1],
        },
    ],
};
