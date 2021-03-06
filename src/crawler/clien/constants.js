const defaultConstants = require('../defaultConstants');

const baseUrl = 'https://www.clien.net';

const boardTypes = ['커뮤니티', '소모임'];

module.exports = {
    ...defaultConstants,
    baseUrl,
    getUrl: board => `${baseUrl}${board}?&po=`,
    sortUrls: [
        {
            name: '등록일순',
            value: '&od=T31',
        },
        {
            name: '공감순',
            value: '&od=T33',
        },
        {
            name: '댓글순',
            value: '&od=T34',
        },
    ],
    boardTypes,
    ignoreBoards: [
        '사진게시판',
        '아무거나질문',
        '알뜰구매',
        '임시소모임',
        '직접홍보',
    ],
    boards: [
        {
            value: '/service/group/clien_all',
            name: '톺아보기',
            type: boardTypes[0],
        },
        {
            value: '/service/recommend',
            name: '오늘의 추천글',
            type: boardTypes[0],
            singlePage: true,
            noSortUrl: true,
        },
        {
            value: '/service/board/annonce',
            name: '운영알림판',
            type: boardTypes[0],
        },
    ],
};
