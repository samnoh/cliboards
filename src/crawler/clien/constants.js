const baseUrl = 'https://www.clien.net';

const boardTypes = ['커뮤니티', '소모임'];

module.exports = {
    baseUrl,
    getUrl: (boardName) => `${baseUrl}${boardName}?&po=`,
    sortUrls: [
        {
            name: '등록일순',
            value: '&od=T31',
        },
        {
            name: '공감순',
            value: '&od=T33',
        },
    ],
    boardTypes,
    ignoreBoards: ['사진게시판', '아무거나질문', '알뜰구매', '임시소모임', '직접홍보'],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset', 'script'],
    boards: [
        {
            value: '/service/group/clien_all',
            name: '톺아보기',
            type: boardTypes[0],
        },
        {
            value: '/service/recommend',
            name: '추천글',
            type: boardTypes[0],
            singlePage: true,
            noSortUrl: true,
        },
    ],
};
