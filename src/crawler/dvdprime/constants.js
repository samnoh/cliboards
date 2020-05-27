const baseUrl = 'https://dvdprime.com';

const boardTypes = ['영화‧드라마‧음악', '홈시어터', '커뮤니티'];

module.exports = {
    baseUrl,
    getUrl: (board) => `${baseUrl}${board}&page=`,
    sortUrls: [],
    boardTypes,
    ignoreBoards: [],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset', 'script'],
    boards: [
        {
            name: '영화이야기',
            value: '/g2/bbs/board.php?bo_table=movie',
            type: boardTypes[0],
        },
        {
            name: '블루레이‧DVD',
            value: '/g2/bbs/board.php?bo_table=blue_ray',
            type: boardTypes[0],
        },
        {
            name: '넷플릭스‧OTT',
            value: '/g2/bbs/board.php?bo_table=netflix',
            type: boardTypes[0],
        },
        {
            name: 'LP‧CD',
            value: '/g2/bbs/board.php?bo_table=lpcd',
            type: boardTypes[0],
        },
        {
            name: '디스플레이',
            value: '/g2/bbs/board.php?bo_table=display',
            type: boardTypes[1],
        },
        {
            name: 'A/V‧하이파이',
            value: '/g2/bbs/board.php?bo_table=hometheater',
            type: boardTypes[1],
        },
        {
            name: '사운드바',
            value: '/g2/bbs/board.php?bo_table=soundbar',
            type: boardTypes[1],
        },
        {
            name: '플레이어‧HTPC',
            value: '/g2/bbs/board.php?bo_table=pc_players',
            type: boardTypes[1],
        },
        {
            name: '프라임차한잔',
            value: '/g2/bbs/board.php?bo_table=comm',
            type: boardTypes[2],
        },
        {
            name: '못웃기면맞는다',
            value: '/g2/bbs/board.php?bo_table=humor',
            type: boardTypes[2],
        },
        {
            name: '중고장터',
            value: '/g2/bbs/board.php?bo_table=market',
            type: boardTypes[2],
        },
    ],
};
