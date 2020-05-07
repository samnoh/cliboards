const blessed = require('blessed');
const open = require('open');

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
            items: boards.map(({ name }) => name),
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
            tags: true,
            keys: true,
            vi: true,
            alwaysScroll: true,
            width: '100%',
            padding: {
                bottom: 1,
            },
            scrollbar: {
                ch: ' ',
                inverse: true,
            },
        });
        this.widgets = [this.boardList, this.listList, this.detailBox];

        this.clien = new Clien();
        this.terminateCallback = async () => await this.clien.close();
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
                switch (full) {
                    case 'r':
                        await this.refreshPostDetail();
                        break;
                    case 'o':
                        await open(this.posts[this.currentPostIndex].link);
                        break;
                    case 'h':
                    case 'left':
                        if (this.currentPostIndex) {
                            this.currentPostIndex -= 1;
                        } else if (this.clien.currentPageNumber) {
                            this.clien.currentPageNumber -= 1;
                            await this.refreshPosts();
                            this.currentPostIndex = this.posts.length - 1;
                        } else {
                            break;
                        }
                        await this.refreshPostDetail();
                        break;
                    case ';':
                    case 'right':
                        this.currentPostIndex += 1;

                        if (this.currentPostIndex === this.posts.length) {
                            this.clien.currentPageNumber += 1;
                            await this.refreshPosts();
                            this.currentPostIndex = 0;
                        }
                        await this.refreshPostDetail();
                        break;
                }
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
                    this.renderComments();
                });
            });
            //#endregion select

            //#region focus
            this.boardList.on('focus', () => {
                this.currentPostIndex = 0;
                this.clien.currentPageNumber = 0;
                this.setTitleFooterContent('클리앙', 'CLIboard', 'q: quit, i: login, h: info');
            });

            this.listList.on('focus', () => {
                this.listList.scrollTo(this.currentPostIndex);
                this.flushComments();
                this.setTitleFooterContent(
                    boards[this.clien.currentBoardIndex].name,
                    `${this.clien.currentPageNumber + 1} 페이지`,
                    'q: back, r: refresh, left/right arrow: prev/next page'
                );
            });

            this.detailBox.on('focus', () => {
                const { title, author, hit, upVotes, comments, time } = this.post;
                this.setTitleFooterContent(
                    `${title} {gray-fg}${comments.length}{/}`,
                    `${author} | ${hit} | ${upVotes} | ${time}`,
                    'q: back, r: refresh, o: open, left/right arrow: prev/next post'
                );
            });
            //#endregion focus

            this.boardList.focus();
        } catch (e) {}
    }

    async getPosts(index) {
        try {
            this.footerBox.focus();
            this.posts = await this.clien.changeBoard(boards[index]);
        } catch (e) {}
    }

    async getPostDetail(index) {
        try {
            this.footerBox.focus();
            this.currentPostIndex = index;
            if (this.posts[index])
                this.post = await this.clien.getPostDetail(this.posts[index].link);
        } catch (e) {}
    }

    async refreshPosts() {
        await this.getPosts(this.clien.currentBoardIndex);

        this.listList.setItems(
            this.posts.map(
                ({ title, numberOfComments, author }) =>
                    `${title} {gray-fg}${numberOfComments} {|}${author}{/}`
            )
        );
        this.listList.select(0);
        this.currentPostIndex = 0;
        this.listList.focus();
    }

    async refreshPostDetail() {
        await this.getPostDetail(this.currentPostIndex);

        this.flushComments();
        this.detailBox.scrollTo(0);
        this.detailBox.setContent(this.post.body);
        this.renderComments();
        this.listList.select(this.currentPostIndex);
        this.detailBox.focus();
    }

    renderComments() {
        const { comments } = this.post;

        if (!comments.length) return;

        let prevTop = this.detailBox.getScreenLines().length + 1;

        this.commentBoxes = comments.map(({ body, isRemoved, isReply, author, time, upVotes }) => {
            const info = `{gray-fg}${author}{|} ${
                upVotes ? `{green-fg}${upVotes}{/green-fg} | ` : ''
            }${time}{/}\n`;

            const commentBox = blessed.box({
                parent: this.detailBox,
                top: prevTop,
                width: '100%-1',
                height: parseInt(body.length / this.detailBox.width) + 5,
                content: isRemoved ? body : info + body,
                border: {
                    type: 'line',
                    fg: 'gray',
                },
                tags: true,
                padding: {
                    left: isReply ? 4 : 0,
                },
            });

            commentBox.height = commentBox.getScreenLines().length + 2;
            prevTop += commentBox.height - 1;

            return commentBox;
        });
    }

    flushComments() {
        const { commentBoxes } = this;

        if (commentBoxes) {
            commentBoxes.map((box) => box.destroy());
            commentBoxes.length = 0;
        }
    }
}

module.exports = new CLIClien();
