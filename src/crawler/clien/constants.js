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
};
