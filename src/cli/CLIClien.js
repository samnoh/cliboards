const blessed = require('blessed');

const CLI = require('./CLI');
const {
    Clien,
    constants: { boards },
} = require('../crawlers/clien');

class CLIClien extends CLI {
    constructor() {
        super();

        this.boardList = blessed.list({
            parent: this.bodyBox,
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
        this.listList = blessed.list({
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
        this.detailBox = blessed.box({
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
        this.widgets = [this.boardList, this.listList, this.detailBox];
        this.screen.render();

        this.clien = new Clien();
        this.terminateCallback = async () => await this.clien.close();
        this.posts = [];
    }

    async start() {
        try {
            //#region select
            this.boardList.on('select', async (item, index) => {
                this.titleBox.focus();
                this.posts = await this.clien.changeBoard(boards[index]);

                this.moveToWidget('next');
                this.listList.setItems(this.posts.map((post) => post.name));
                this.listList.focus();
            });

            this.listList.on('select', async (item, index) => {
                this.titleBox.focus();
                const post = await this.clien.getPostDetail(this.posts[index].value);

                this.moveToWidget('next');
                this.detailBox.setContent(post.body);
                this.detailBox.focus();
            });
            //#endregion select

            //#region focus
            this.boardList.on('focus', () => {
                this.focusEventCallback('CLI-ang', 'q: quit');
            });

            this.listList.on('focus', () => {
                this.focusEventCallback(
                    `${boards[this.clien.currentBoardIndex].name} ${
                        this.clien.currentPageNumber + 1
                    } 페이지`,
                    'q: back'
                );
            });

            this.detailBox.on('focus', () => {
                this.focusEventCallback(`title...`, 'q: back');
            });
            //#endregion

            await this.clien.start();

            this.boardList.focus();
        } catch (e) {
            console.error(e);
        }
    }

    focusEventCallback(titleText, footerText) {
        this.titleBox.setContent(titleText);
        this.footerBox.setContent(footerText);

        this.screen.render();
    }
}

module.exports = new CLIClien();
