const inquirer = require('inquirer');

const clien = require('./Clien');
const { boards } = require('./constants');

const promptBoard = async () => {
    try {
        await clien.init();
        clien.currentPageNumber = 0;

        const { board } = await inquirer.prompt({
            type: 'list',
            name: 'board',
            message: '게시판을 선택하세요',
            choices: [
                ...boards,
                new inquirer.Separator(),
                { name: '종료', value: 'close' },
                new inquirer.Separator(),
            ],
            pageSize: 6,
        });

        if (board === 'close') {
            await clien.close();
        } else {
            const posts = await clien.changeBoard(board);
            await promptNavigate(posts);
        }
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
        await clien.getPostDetail(link);

        const { answer } = await inquirer.prompt({
            type: 'list',
            name: 'answer',
            message: '선택하세요',
            choices: [
                { name: '댓글', value: 'comments' },
                { name: '뒤로', value: 'back' },
                { name: '새로고침', value: 'refresh' },
            ],
        });

        if (answer === 'comments') {
            await promptComments();
        } else if (answer === 'back') {
            const posts = await clien.getPosts();
            await promptNavigate(posts);
        } else {
            await promptDetail(link);
        }
    } catch (e) {
        console.error(e);
    }
};

const promptComments = async () => {};

module.exports = {
    promptBoard,
};
