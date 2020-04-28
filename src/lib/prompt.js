const blessed = require('blessed');

const clien = require('./Clien');
const { boards } = require('./constants');

const screen = blessed.screen({
    fastCSR: true,
    fullUnicode: true,
    error: true,
});

const box = blessed.box({
    parent: screen,
    width: '100%',
    height: '100%',
});

const titleBox = blessed.box({
    parent: box,
    content: `title: blah`,
    top: 0,
    width: '100%',
    height: 1,
    padding: {
        left: 2,
        right: 2,
    },
    style: {
        bg: '#243B4D',
    },
});

const bodyBox = blessed.box({
    parent: box,
    scrollable: true,
    keys: true,
    vi: true,
    alwaysScroll: true,
    top: 1,
    bottom: 1,
    width: '100%',
    scrollbar: {
        ch: ' ',
        inverse: true,
    },
});

const footerBox = blessed.box({
    parent: box,
    width: '100%',
    top: '100%-1',
    height: 1,
    padding: {
        left: 2,
    },
    style: {
        bg: '#243B4D',
    },
});

const boardList = blessed.list({
    parent: bodyBox,
    items: boards.map((board) => board.name),
    width: '100%',
    scrollbar: {
        ch: ' ',
        style: {
            inverse: true,
        },
    },
    style: {
        selected: {
            bg: 'red',
        },
    },
    keys: true,
    vi: true,
    draggable: true,
});

const listList = blessed.list({
    width: '100%',
    scrollbar: {
        ch: ' ',
        style: {
            inverse: true,
        },
    },
    style: {
        selected: {
            bg: 'red',
        },
    },
    keys: true,
    vi: true,
    draggable: true,
});

const detailBox = blessed.box({
    scrollable: true,
    keys: true,
    vi: true,
    alwaysScroll: true,
    width: '100%',
    scrollbar: {
        ch: ' ',
        inverse: true,
    },
});

const WIDGETS = {
    BOARD: 'BOARD',
    LIST: 'LIST',
    DETAIL: 'DETAIL',
    COMMENT: 'COMMENT',
};

let currentWidget = WIDGETS.BOARD,
    posts = [];

const setKeyBindings = () => {
    screen.free();

    screen.key('C-c', async (ch, key) => {
        if (key.full === 'C-c') {
            await clien.close();
            screen.destroy();
            return process.exit(0);
        }
    });

    screen.key(['escape', 'q'], async (ch, key) => {
        if (currentWidget === WIDGETS.LIST) {
            listList.detach();
            bodyBox.append(boardList);
            boardList.focus();
        } else if (currentWidget === WIDGETS.DETAIL) {
            detailBox.detach();
            bodyBox.append(listList);
            listList.focus();
        }
        screen.render();
    });
};

// screen.key(['escape', 'q', 'c', 'r', 'C-c'], async (ch, key) => {
//     switch (key.full) {
//         case 'escape':
//         case 'q':
//             if (currentWidget === WIDGETS.LIST) {
//                 const posts = await clien.getPosts();
//             }
//             await promptNavigate(posts);
//             return;
//         case 'r':
//             await promptDetail(link);
//             return;
//         case 'C-c':
//     }
// });

const promptList = async (posts) => {
    // const menu = [
    //     { name: '처음', value: 'first' },
    //     { name: '이전', value: 'prev' },
    //     { name: '다음', value: 'next' },
    //     { name: '새로고침', value: 'refresh' },
    //     { name: '뒤로', value: 'back' },
    // ];

    // if (clien.currentPageNumber === 0) {
    //     menu.shift();
    //     menu.shift();
    // } else if (clien.currentPageNumber === 1) {
    //     menu.shift();
    // }

    try {
        // const { answer } = await inquirer.prompt({
        //     type: 'list',
        //     name: 'answer',
        //     message: '선택하세요',
        //     choices: [...posts, new inquirer.Separator(), ...menu, new inquirer.Separator()],
        // });
        // if (answer === 'first' || answer === 'prev' || answer === 'next') {
        //     const posts = await clien.changePageNumber(
        //         answer === 'first'
        //             ? 0
        //             : answer === 'prev'
        //             ? clien.currentPageNumber - 1
        //             : clien.currentPageNumber + 1
        //     );
        //     await promptNavigate(posts);
        // } else if (answer === 'refresh') {
        //     const posts = await clien.getPosts();
        //     await promptNavigate(posts);
        // } else if (answer === 'back') {
        //     await promptBoard();
        // } else {
        //     await promptDetail(answer);
        // }

        const list = blessed.list({
            parent: box,
            label: '선택하세요',
            items: posts.map((post) => post.name),
            width: '100%',
            top: 1,
            bottom: 1,
            scrollbar: {
                ch: ' ',
                style: {
                    inverse: true,
                },
            },
            style: {
                selected: {
                    bg: 'red',
                },
            },
            keys: true,
            vi: true,
            draggable: true,
        });

        list.on('select', async (item, index) => {
            const posts = await clien.changeBoard(boards[index]);
            await promptDetail(posts[index].value);
        });

        list.on('focus', () => {
            currentWidget = WIDGETS.LIST;
        });

        list.focus();

        titleBox.setContent('게시물을 선택하세요');
        footerBox.setContent('test123');

        screen.render();
    } catch (e) {
        console.error(e);
    }
};

const init = async () => {
    try {
        await clien.init();

        setKeyBindings();

        boardList.on('select', async (item, index) => {
            posts = await clien.changeBoard(boards[index]);

            boardList.detach();
            bodyBox.append(listList);

            titleBox.setContent(boards[index].name);
            listList.setItems(posts.map((post) => post.name));
            listList.focus();

            screen.render();
        });

        listList.on('select', async (item, index) => {
            const post = await clien.getPostDetail(posts[index].value);

            listList.detach();
            bodyBox.append(detailBox);
            detailBox.setContent(post.body);
            detailBox.focus();

            screen.render();
        });

        boardList.on('focus', () => {
            currentWidget = WIDGETS.BOARD;
        });

        listList.on('focus', () => {
            currentWidget = WIDGETS.LIST;
        });

        bodyBox.on('focus', () => {
            currentWidget = WIDGETS.DETAIL;
        });

        titleBox.setContent('게시판을 선택하세요');
        footerBox.setContent('test!!');

        boardList.focus();

        screen.render();
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    init,
};
