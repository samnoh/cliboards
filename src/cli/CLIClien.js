const blessed = require('blessed');

const CLI = require('./CLI');
const {
    Clien,
    constants: { boards },
} = require('../crawler/clien');

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
        });
        this.listList = blessed.list({
            width: '100%',
            tags: true,
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

        this.clien = new Clien();
        this.terminateCallback = async () => await this.clien.close();
        this.posts = [];
    }

    async start() {
        try {
            await this.clien.start();

            //#region select
            this.boardList.on('select', async (item, index) => {
                this.titleBox.focus();
                this.posts = await this.clien.changeBoard(boards[index]);

                const nextWidget = this.moveToWidget('next');
                nextWidget.setItems(
                    this.posts.map(
                        (post) =>
                            `${post.title} {gray-fg}${post.numberOfComments} {|} ${post.author}{/}`
                    )
                );

                this.screen.render();
            });

            this.listList.on('select', async (item, index) => {
                this.titleBox.focus();
                const post = await this.clien.getPostDetail(this.posts[index].link);

                const nextWidget = this.moveToWidget('next');
                nextWidget.setContent(post.body);

                this.setTitleFooterContent(
                    `${post.title} {|} {gray-fg}${post.author} | ${post.hit} | ${post.upVotes}{/}`,
                    'q: back'
                );
            });
            //#endregion select

            //#region focus
            this.boardList.on('focus', () => {
                this.setTitleFooterContent('CLI-ang', 'q: quit');
            });

            this.listList.on('focus', () => {
                this.setTitleFooterContent(
                    `${boards[this.clien.currentBoardIndex].name} ${
                        this.clien.currentPageNumber + 1
                    } 페이지`,
                    'q: back'
                );
            });

            this.boardList.focus();
            //#endregion focus
        } catch (e) {
            console.error(e);
        }
    }

    setTitleFooterContent(titleText, footerText) {
        this.titleBox.setContent(titleText);
        this.footerBox.setContent(footerText);

        this.screen.render();
    }
}

module.exports = new CLIClien();
