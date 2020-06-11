const baseUrl = 'https://dvdprime.com';

const boardTypes = ['영화‧드라마‧음악', '홈시어터', '커뮤니티'];

module.exports = {
    baseUrl,
    getUrl: (board) => `${baseUrl}/g2/bbs/board.php?bo_table=${board}&page=`,
    sortUrls: [],
    boardTypes,
    ignoreBoards: [],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset', 'script'],
    boards: [
        {
            name: '영화이야기',
            value: 'movie',
            type: boardTypes[0],
        },
        {
            name: '블루레이‧DVD',
            value: 'blu_ray',
            type: boardTypes[0],
        },
        {
            name: '넷플릭스‧OTT',
            value: 'netflix',
            type: boardTypes[0],
        },
        {
            name: 'LP‧CD',
            value: 'lpcd',
            type: boardTypes[0],
        },
        {
            name: '디스플레이',
            value: 'display',
            type: boardTypes[1],
        },
        {
            name: 'A/V‧하이파이',
            value: 'hometheater',
            type: boardTypes[1],
        },
        {
            name: '사운드바',
            value: 'soundbar',
            type: boardTypes[1],
        },
        {
            name: '플레이어‧HTPC',
            value: 'pc_players',
            type: boardTypes[1],
        },
        {
            name: '프라임차한잔',
            value: 'comm',
            type: boardTypes[2],
        },
        {
            name: '못웃기면맞는다',
            value: 'humor',
            type: boardTypes[2],
        },
    ],
    search: {
        getSearchParams: () => {},
        types: [
            {
                name: '제목',
                value: '',
            },
            {
                name: '제목+내용',
                value: '',
            },
            {
                name: '내용',
                value: '',
            },
            {
                name: '닉네임(본문)',
                value: '',
            },
            {
                name: '닉네임(코멘트)',
                value: '',
            },
            {
                name: '아이디(본문)',
                value: '',
            },
            {
                name: '아이디(코멘트)',
                value: '',
            },
        ],
    },
};
