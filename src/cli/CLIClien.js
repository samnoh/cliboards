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
                    bg: 'lightgray',
                    fg: 'black',
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
                    bg: 'lightgray',
                    fg: 'black',
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

            //#region keys
            // this.listList.on('keypress', async (ch, key) => {
            //     if (key.name === 'left' && this.clien.currentPageNumber > 0) {
            //         // this.posts = await this.clien.changePageNumber(
            //         //     this.clien.currentPageNumber - 1
            //         // );
            //         this.clien.currentPageNumber -= 1;
            //     } else if (key.name === 'right') {
            //         // this.posts = await this.clien.changePageNumber(
            //         //     this.clien.currentPageNumber + 1
            //         // );
            //         this.clien.currentPageNumber += 1;
            //     }
            //     this.boardList.select(boards[this.clien.currentBoardIndex]);
            // });
            //#endregion

            //#region select
            this.boardList.on('select', async (item, index) => {
                this.titleBox.focus();
                this.posts = await this.clien.changeBoard(boards[index]);

                const nextWidget = this.moveToWidget('next');
                nextWidget.setItems(
                    this.posts.map(
                        (post) =>
                            `${post.title} {gray-fg}${post.numberOfComments} {|}${post.author}{/}`
                    )
                );
                this.screen.render();
            });

            this.listList.on('select', async (item, index) => {
                this.titleBox.focus();
                this.post = await this.clien.getPostDetail(this.posts[index].link);

                const nextWidget = this.moveToWidget('next');
                nextWidget.setContent(this.post.body);
                this.screen.render();
            });
            //#endregion select

            //#region focus
            this.boardList.on('focus', () => {
                this.setTitleFooterContent('CLI-ang', '', 'q: quit');
            });

            this.listList.on('focus', () => {
                this.setTitleFooterContent(
                    boards[this.clien.currentBoardIndex].name,
                    `${this.clien.currentPageNumber + 1} 페이지`,
                    'q: back, r: refresh, number: page number, left/right arrow: prev/next page'
                );
            });

            this.detailBox.on('focus', () => {
                const { title, author, hit, upVotes } = this.post;
                this.setTitleFooterContent(title, `${author} | ${hit} | ${upVotes}`, 'q: back');
            });
            //#endregion focus

            this.boardList.focus();
        } catch (e) {
            console.error(e);
        }
    }

    setTitleFooterContent(leftTitleText, rightTitleText, footerText) {
        this.titleBox.setContent(`${leftTitleText} {|}{gray-fg}${rightTitleText}{/}`);
        this.footerBox.setContent(`{gray-fg}${footerText}{/}`);

        this.screen.render();
    }
}

module.exports = new CLIClien();
