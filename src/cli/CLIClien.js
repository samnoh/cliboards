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
        this.currentPostIndex = 0;
    }

    async start() {
        try {
            await this.clien.start();

            //#region keys
            this.listList.on('keypress', async (ch, { full }) => {
                if (full === 'r') {
                    // refresh
                } else if (full === 'left' && this.clien.currentPageNumber) {
                    this.clien.currentPageNumber -= 1;
                } else if (full === 'right') {
                    this.clien.currentPageNumber += 1;
                } else if (!isNaN(parseInt(full))) {
                    this.clien.currentPageNumber = full === '0' ? 9 : full - 1;
                } else {
                    return;
                }
                await this.refreshPosts();
            });

            this.detailBox.on('keypress', async (ch, { full }) => {
                if (full === 'r') {
                    // refresh
                } else if (full === 'left') {
                    if (this.currentPostIndex) {
                        this.currentPostIndex -= 1;
                    } else if (this.clien.currentPageNumber) {
                        this.clien.currentPageNumber -= 1;
                        await this.refreshPosts();
                        this.currentPostIndex = this.posts.length - 1;
                    } else return;
                } else if (full === 'right') {
                    this.currentPostIndex += 1;

                    if (this.currentPostIndex === this.posts.length) {
                        this.clien.currentPageNumber += 1;
                        await this.refreshPosts();
                        this.currentPostIndex = 0;
                    }
                } else {
                    return;
                }
                await this.refreshPostDetail();
            });
            //#endregion

            //#region select
            this.boardList.on('select', async (item, index) => {
                await this.getPosts(index);

                this.moveToWidget('next', (nextWidget) => {
                    nextWidget.setItems(
                        this.posts.map(
                            ({ title, numberOfComments, author }) =>
                                `${title} {gray-fg}${numberOfComments} {|}${author}{/}`
                        )
                    );
                });
            });

            this.listList.on('select', async (item, index) => {
                await this.getPostDetail(index);

                this.moveToWidget('next', (nextWidget) => {
                    nextWidget.setContent(this.post.body);
                });
            });
            //#endregion select

            //#region focus
            this.boardList.on('focus', () => {
                this.clien.currentPageNumber = 0;
                this.setTitleFooterContent('클리앙', 'CLIboard', 'q: quit');
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
                this.setTitleFooterContent(
                    title,
                    `${author} | ${hit} | ${upVotes}`,
                    'q: back, r: refresh, left/right arrow: prev/next post'
                );
            });
            //#endregion focus

            this.boardList.focus();
        } catch (e) {
            // console.error(e);
        }
    }

    async getPosts(index) {
        this.footerBox.focus();
        this.posts = await this.clien.changeBoard(boards[index]);
    }

    async getPostDetail(index) {
        this.footerBox.focus();
        this.currentPostIndex = index;
        if (this.posts[index]) this.post = await this.clien.getPostDetail(this.posts[index].link);
    }

    async refreshPosts() {
        await this.getPosts(this.clien.currentBoardIndex);
        this.listList.select(0);
        this.listList.setItems(
            this.posts.map(
                ({ title, numberOfComments, author }) =>
                    `${title} {gray-fg}${numberOfComments} {|}${author}{/}`
            )
        );
        this.listList.focus();
    }

    async refreshPostDetail() {
        await this.getPostDetail(this.currentPostIndex);
        this.detailBox.setContent(this.post.body);
        this.listList.select(this.currentPostIndex);
        this.detailBox.focus();
    }
}

module.exports = new CLIClien();
