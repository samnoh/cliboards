module.exports = {
    baseUrl: 'https://clien.net',
    getUrl: (boardName) => `https://www.clien.net${boardName}?&po=`,
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
    boardTypes: ['커뮤니티', '소모임'],
    ignoreBoards: ['사진게시판', '아무거나질문', '임시소모임'],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset', 'script'],
};
