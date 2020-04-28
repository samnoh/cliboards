const blessed = require('blessed');

const clien = require('./Clien');
const { boards } = require('./constants');

program = blessed.program();

const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
});

screen.key(['escape', 'q', 'c', 'r', 'C-c'], async (ch, key) => {
    program.clear();
    program.disableMouse();
    program.showCursor();
    program.normalBuffer();

    switch (key.name) {
        case 'escape':
        case 'q':
            const posts = await clien.getPosts();
            await promptNavigate(posts);
            return;
        case 'c':
            await promptComments();
            return;
        case 'r':
            await promptDetail(link);
            return;
        case 'C-c':
            process.exit(0);
        default:
            return;
    }
});

const init = async () => {
    try {
        await clien.init();
    } catch (e) {
        console.log(e);
    }
};

const promptBoard = async () => {
    try {
        await clien.init();

        const list = blessed.list({
            parent: screen,
            label: '선택하세요',
            items: boards.map((board) => board.name),
            width: '100%',
            scrollbar: {
                ch: ' ',
                track: {
                    bg: 'cyan',
                },
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
            mouse: true,
            border: 'line',
            draggable: true,
        });
        list.select(0);

        list.on('select', async (item, index) => {
            list.hide();
            program.clear();
            const posts = await clien.changeBoard(boards[index]);
            await promptNavigate(posts);
        });

        list.focus();
        screen.append(list);
        screen.render();
    } catch (e) {
        console.error(e);
    }
};

const promptNavigate = async (posts) => {
    const menu = [
        { name: '처음', value: 'first' },
        { name: '이전', value: 'prev' },
        { name: '다음', value: 'next' },
        { name: '새로고침', value: 'refresh' },
        { name: '뒤로', value: 'back' },
    ];

    if (clien.currentPageNumber === 0) {
        menu.shift();
        menu.shift();
    } else if (clien.currentPageNumber === 1) {
        menu.shift();
    }

    try {
        const { answer } = await inquirer.prompt({
            type: 'list',
            name: 'answer',
            message: '선택하세요',
            choices: [...posts, new inquirer.Separator(), ...menu, new inquirer.Separator()],
        });

        if (answer === 'first' || answer === 'prev' || answer === 'next') {
            const posts = await clien.changePageNumber(
                answer === 'first'
                    ? 0
                    : answer === 'prev'
                    ? clien.currentPageNumber - 1
                    : clien.currentPageNumber + 1
            );
            await promptNavigate(posts);
        } else if (answer === 'refresh') {
            const posts = await clien.getPosts();
            await promptNavigate(posts);
        } else if (answer === 'back') {
            await promptBoard();
        } else {
            await promptDetail(answer);
        }
    } catch (e) {
        console.error(e);
    }
};

const promptDetail = async (link) => {
    try {
        const postDetail = await clien.getPostDetail(link);

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
            content: postDetail.body,
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

        const bottomBox = blessed.box({
            parent: box,
            content: 'q: back, c: comments, r: refresh',
            width: '100%',
            top: '100%-1',
            padding: {
                left: 2,
            },
            height: 1,
            style: {
                bg: '#243B4D',
            },
        });

        bodyBox.focus();

        screen.render();
    } catch (e) {
        console.error(e);
    }
};

module.exports = {
    init,
};
