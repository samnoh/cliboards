const blessed = require('blessed');
const open = require('open');

const CLI = require('./CLI');
const {
    Clien,
    constants: { sortUrls },
} = require('../crawler/clien');
const config = require('../helper/configstore');

class CLIClien extends CLI {
    constructor() {
        super();

        this.clien = new Clien();
        this.isSubBoard = false;
        this.terminateCallback = async () => await this.clien.close();

        this.boardList = blessed.list({
            parent: this.bodyBox,
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
    }

    async start() {
        try {
            await this.clien.start();

            //#region keypress
            this.boardList.on('keypress', async (ch, { full }) => {
                switch (full) {
                    case 'r':
                        config.delete('clien/boards');
                        this.clien.boards.length = 0;
                        await this.getBoards(this.isSubBoard);
                        break;
                    case 'right':
                        this.getCurrentBoards(true);
                        break;
                    case 'left':
                        this.getCurrentBoards(false);
                        break;
                }
            });

            this.listList.on('keypress', async (ch, { full }) => {
                if (!this.posts.length) return;

                if (full === 'r') {
                    // refresh
                } else if (full === 's') {
                    // 1 ^ this.clien.sortListIndex: 1 -> 0 or 0 -> 1
                    this.clien.changeSortList(1 ^ this.clien.sortListIndex);
                    // this.listList.setItems([]);
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
                if (!this.post) return;

                switch (full) {
                    case 'r':
                        await this.refreshPostDetail();
                        break;
                    case 'i':
                        this.openImages();
                        break;
                    case 'o':
                        await open(this.posts[this.currentPostIndex].link);
                        break;
                    case 'h':
                    case 'left':
                        if (this.currentPostIndex) {
                            this.currentPostIndex -= 1;
                            this.posts[this.currentPostIndex].hasRead = true;
                            await this.refreshPostDetail();
                        } else if (this.clien.currentPageNumber) {
                            this.clien.currentPageNumber -= 1;
                            await this.refreshPosts();
                            this.currentPostIndex = this.posts.length - 1;
                            this.posts[this.currentPostIndex].hasRead = true;
                            await this.refreshPostDetail();
                        }
                        break;
                    case 'l':
                    case 'right':
                        this.currentPostIndex += 1;

                        if (this.currentPostIndex === this.posts.length) {
                            this.clien.currentPageNumber += 1;
                            await this.refreshPosts();
                            this.currentPostIndex = 0;
                        }

                        await this.refreshPostDetail();
                        this.posts[this.currentPostIndex].hasRead = true;

                        break;
                }
            });
            //#endregion

            //#region select
            this.boardList.on('select', async (item, index) => {
                await this.getPosts(index);
                this.moveToWidget('next');
            });

            this.listList.on('select', async (item, index) => {
                try {
                    await this.getPostDetail(index);

                    this.posts[index].hasRead = true;
                    this.moveToWidget('next', () => {
                        this.rednerDetailBody();
                    });
                } catch (e) {
                    this.moveToWidget('next');
                }
            });
            //#endregion select

            //#region focus
            this.boardList.on('focus', () => {
                if (!this.boardList.getItem(0)) {
                    this.setTitleFooterContent('Error', '', 'q: quit, r: refresh');
                    return;
                }
                this.currentPostIndex = 0;
                this.clien.changeSortList(0);
                this.setTitleFooterContent(
                    '클리앙',
                    this.isSubBoard ? '소모임' : '커뮤니티',
                    'q: quit, r: refresh, left/right arrow: prev/next page'
                );
            });

            this.listList.on('focus', () => {
                if (!this.posts.length) {
                    this.listList.setItems([]);
                    this.setTitleFooterContent('Error', '', 'q: back');
                    return;
                }

                this.listList.setItems(
                    this.posts.map(
                        ({ category, title, numberOfComments, author, hasRead, hasImages }) =>
                            `${category ? '{gray-fg}' + category + '{/} ' : ''}${
                                hasRead ? '{gray-fg}' + title + '{/}' : title
                            } {gray-fg}${
                                hasImages
                                    ? '{underline}' + numberOfComments + '{/underline}'
                                    : numberOfComments
                            }  {|}${author}{/}`
                    )
                );
                this.listList.scrollTo(this.currentPostIndex);
                this.listList.select(this.currentPostIndex);

                this.setTitleFooterContent(
                    this.clien.boards[this.clien.currentBoardIndex].name,
                    `${this.clien.currentPageNumber + 1} 페이지 | ${
                        sortUrls[this.clien.sortListIndex].name
                    }`,
                    'q: back, r: refresh, s: sort, left/right arrow: prev/next page'
                );
            });

            this.detailBox.on('focus', () => {
                if (!this.post) {
                    this.detailBox.setContent('');
                    this.flushComments();
                    this.setTitleFooterContent('Error', '', 'q: back');
                    return;
                }

                const {
                    category,
                    title,
                    author,
                    hit,
                    upVotes,
                    comments,
                    time,
                    images,
                    hasImages,
                } = this.post;
                this.setTitleFooterContent(
                    `${category ? '[' + category + '] ' : ''}${title} {gray-fg}${
                        comments.length
                    }{/}`,
                    `${author} | ${hit} | ${upVotes} | ${time}`,
                    `q: back, r: refresh, o: open, ${
                        hasImages
                            ? `i: view ${images.length} image${images.length !== 1 ? 's' : ''}, `
                            : ''
                    }left/right arrow: prev/next post`
                );
            });
            //#endregion focus

            await this.getBoards(this.isSubBoard);
        } catch (e) {
            this.terminate();
        }
    }

    async getBoards(isSub) {
        try {
            if (!this.clien.boards.length) {
                this.footerBox.focus();

                await this.clien.getBoards();
                this.mainBoardsLength = this.clien.boards.filter(({ isSub }) => !isSub).length;
            }

            this.isSubBoard = isSub;
            this.boardList.setItems(
                this.clien.boards
                    .filter(({ isSub }) => isSub === this.isSubBoard)
                    .map(({ name }) => name)
            );
            this.boardList.focus();
        } catch (e) {
            this.boardList.setItems([]);
            this.boardList.focus();
        }
    }

    async getCurrentBoards(isSub) {
        this.boardList.scrollTo(0);
        this.boardList.select(0);
        isSub !== this.isSubBoard && (await this.getBoards(isSub));
    }

    async getPosts(index) {
        try {
            this.footerBox.focus();

            this.posts = await this.clien.changeBoard(
                this.clien.boards[this.isSubBoard ? index + this.mainBoardsLength : index]
            );
        } catch (e) {
            this.posts = [];
            throw new Error(e);
        }
    }

    async refreshPosts() {
        try {
            await this.getPosts(
                this.isSubBoard
                    ? this.clien.currentBoardIndex - this.mainBoardsLength
                    : this.clien.currentBoardIndex
            );
            this.currentPostIndex = 0;
        } catch (e) {
        } finally {
            this.listList.focus();
        }
    }

    async getPostDetail(index) {
        try {
            this.footerBox.focus();
            this.currentPostIndex = index;

            if (this.posts[index]) {
                this.post = await this.clien.getPostDetail(this.posts[index].link);
            }
        } catch (e) {
            this.post = null;
            throw new Error(e);
        }
    }

    async refreshPostDetail() {
        try {
            await this.getPostDetail(this.currentPostIndex);
            this.listList.select(this.currentPostIndex);
            this.rednerDetailBody();
        } catch (e) {
        } finally {
            this.detailBox.focus();
        }
    }

    rednerDetailBody() {
        this.detailBox.setContent(
            this.post.body.replace(/(GIF_\d+|IMAGE_\d+)/g, '{inverse}$&{/inverse}')
        );
        this.renderComments();
        this.detailBox.scrollTo(0);
    }

    renderComments() {
        this.flushComments();

        const { comments } = this.post;

        if (!comments || !comments.length) return;

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

    openImages() {
        const { images } = this.post;

        if (!images || !images.length) return;

        images.map(async (image, index) => {
            try {
                await open(image, { background: true });
            } catch (e) {
                // Error
            }
        });
    }
}

module.exports = new CLIClien();
