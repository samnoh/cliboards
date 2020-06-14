const baseUrl = 'https://bbs.ruliweb.com';

const boardTypes = ['PS4/5', 'SWITCH', 'XBO/SX', 'PC', '취미갤'];

module.exports = {
    baseUrl,
    getUrl: board => `${baseUrl}${board}?page=`,
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
};
