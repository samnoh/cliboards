module.exports = {
    baseUrl: 'https://clien.net',
    getUrl: (boardName) => `https://www.clien.net/service/board/${boardName}?&po=`,
    boards: [
        {
            value: 'park',
            name: '모두의공원',
        },
        {
            value: 'news',
            name: '새로운소식',
        },
        {
            value: 'cm_iphonien',
            name: '아이포니앙',
        },
        {
            value: 'cm_mac',
            name: 'MaClien',
        },
    ],
};
