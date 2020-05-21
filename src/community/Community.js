const blessed = require('blessed');

const CLI = require('./CLI');
const { openUrls } = require('../helpers');
const { getCrawler, crawlers } = require('../crawler');

class Community extends CLI {
    constructor() {
        super();

        this.communityList = blessed.list({
            parent: this.bodyBox,
            tags: true,
            scrollbar: {
                ch: ' ',
                style: {
                    inverse: true,
                },
            },
            style: {
                selected: {
                    bg: this.colors.cursor_bg,
                    fg: this.colors.cursor_color,
                },
                bg: this.colors.list_bg,
                fg: this.colors.list_left_color,
            },
            keys: true,
            vi: true,
        });
        this.boardsList = blessed.list({
            scrollbar: {
                ch: ' ',
                style: {
                    inverse: true,
                },
            },
            style: {
                selected: {
                    bg: this.colors.cursor_bg,
                    fg: this.colors.cursor_color,
                },
                bg: this.colors.list_bg,
                fg: this.colors.list_left_color,
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
                    bg: this.colors.cursor_bg,
                    fg: this.colors.cursor_color,
                },
                bg: this.colors.list_bg,
                fg: this.colors.list_left_color,
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
            scrollbar: {
                ch: ' ',
                inverse: true,
            },
            style: {
                bg: this.colors.post__bg,
                fg: this.colors.post_color,
            },
        });

        this.widgets = [this.communityList, this.boardsList, this.listList, this.detailBox];
    }

    static start() {
        const community = new Community();

        community.setAllEvents();
        community.communityList.setItems(crawlers);
        community.communityList.focus();

        return community;
    }

    setKeyPressEvent() {
        super.setKeyPressEvent();

        this.boardsList.on('keypress', async (_, { full }) => {
            const boardTypesLength = this.crawler.boardTypes.length;

            switch (full) {
                case 'r':
                    this.crawler.deleteBoards();
                    this.crawler.boards.length = 0;
                    await this.getBoards(0);
                    break;
                case 'right':
                    this.currentBoardTypeIndex =
                        (this.currentBoardTypeIndex + 1) % boardTypesLength;
                    await this.getBoards(this.currentBoardTypeIndex);
                    break;
                case 'left':
                    if (!this.currentBoardTypeIndex) {
                        this.currentBoardTypeIndex = boardTypesLength - 1;
                    } else {
                        this.currentBoardTypeIndex =
                            (this.currentBoardTypeIndex - 1) % boardTypesLength;
                    }
                    await this.getBoards(this.currentBoardTypeIndex);
                    break;
            }
        });

        this.listList.on('keypress', async (_, { full }) => {
            if (!this.posts.length) return;

            const prevPaggeNumber = this.crawler.pageNumber;
            const prevPosts = this.posts;
            const prevPostIndex = this.currentPostIndex;

            if (full === 'r') {
                // refresh
            } else if (full === 's') {
                // 1 ^ this.crawler.sortListIndex: 1 -> 0 or 0 -> 1
                this.crawler.changeSortList(1 ^ this.crawler.sortListIndex);
                // this.listList.setItems([]);
            } else if (full === 'left' && this.crawler.pageNumber) {
                this.crawler.pageNumber -= 1;
            } else if (full === 'right') {
                this.crawler.pageNumber += 1;
            } else if (!isNaN(parseInt(full))) {
                this.crawler.pageNumber = full === '0' ? 9 : full - 1;
            } else {
                return;
            }

            await this.refreshPosts();

            if (!this.posts.length) {
                // no more pages -> go back to the previous page
                this.crawler.pageNumber = prevPaggeNumber;
                this.posts = prevPosts;
                this.currentPostIndex = prevPostIndex;
                this.listList.focus();
            }
        });

        this.detailBox.on('keypress', async (_, { full }) => {
            if (!this.post) return;

            switch (full) {
                case 'r':
                    await this.refreshPostDetail();
                    break;
                case 'i':
                    await openUrls(this.post.images || null);
                    break;
                case 'o':
                    await openUrls(this.posts[this.currentPostIndex].link);
                    break;
                case 'h':
                case 'left':
                    if (this.currentPostIndex) {
                        this.currentPostIndex -= 1;
                        this.posts[this.currentPostIndex].hasRead = true;
                        await this.refreshPostDetail();
                    } else if (this.crawler.pageNumber) {
                        this.crawler.pageNumber -= 1;
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
                        const prevPosts = this.posts;
                        this.crawler.pageNumber += 1;

                        await this.refreshPosts();

                        if (this.posts.length) {
                            this.currentPostIndex = 0;
                        } else {
                            // no more pages -> go back to the last page
                            this.crawler.pageNumber -= 1;
                            this.currentPostIndex = prevPosts.length - 1;
                            this.posts = prevPosts;
                        }
                    }

                    await this.refreshPostDetail();
                    this.posts[this.currentPostIndex].hasRead = true;
                    break;
            }
        });
    }

    setSelectEvent() {
        super.setSelectEvent();

        this.communityList.on('select', async (_, index) => {
            this.crawler && (await this.crawler.close());
            this.crawler = getCrawler(index);
            this.screen.title = this.crawler.title;
            await this.crawler.start();

            await this.getBoards(index);
            this.moveToWidget('next');
        });

        this.boardsList.on('select', async (_, index) => {
            await this.getPosts(index);
            this.moveToWidget('next');
        });

        this.listList.on('select', async (_, index) => {
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
    }

    setFocusEvent() {
        super.setFocusEvent();

        this.communityList.on('focus', () => {
            this.screen.title = '';
            this.setTitleFooterContent('커뮤니티 목록', '', 'q: quit');
        });

        this.boardsList.on('focus', () => {
            if (!this.boardsList.getItem(0)) {
                this.setTitleFooterContent('Error', '', 'q: quit, r: refresh');
                return;
            }
            this.currentPostIndex = 0;
            this.crawler.changeSortList(0);
            this.setTitleFooterContent(
                this.crawler.title,
                this.crawler.boardTypes[this.currentBoardTypeIndex],
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
                        `${
                            category
                                ? `{${this.colors.list_info_color}-fg}` + category + '{/} '
                                : ''
                        }${
                            hasRead ? `{${this.colors.list_read_color}-fg}` + title + '{/}' : title
                        } {${this.colors.list_info_color}-fg}${
                            hasImages
                                ? '{underline}' + numberOfComments + '{/underline}'
                                : numberOfComments
                        }{/}  {|}{${this.colors.list_right_color}-fg}${author}{/}`
                )
            );
            this.resetScroll(this.listList, this.currentPostIndex);

            this.setTitleFooterContent(
                this.crawler.boards[this.crawler.currentBoardIndex].name,
                `${this.crawler.pageNumber + 1} 페이지${
                    this.crawler.sortUrl ? ' | ' + this.crawler.sortUrl.name : ''
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
                `${
                    category ? `{${this.colors.top_info_color}-fg}` + category + '{/} ' : ''
                }${title} {${this.colors.top_info_color}-fg}${comments.length}{/}`,
                `${author} | ${hit} | ${upVotes} | ${time}`,
                `q: back, r: refresh, o: open, ${
                    hasImages
                        ? `i: view ${images.length} image${images.length !== 1 ? 's' : ''}, `
                        : ''
                }left/right arrow: prev/next post`
            );
        });
    }

    setBlurEvent() {
        super.setBlurEvent();
    }

    setAllEvents() {
        this.setKeyPressEvent();
        this.setSelectEvent();
        this.setFocusEvent();
        this.setBlurEvent();
    }

    async getBoards(index) {
        try {
            this.currentBoardTypeIndex = index;

            if (!this.crawler.boards.length) {
                this.currentBoardTypeIndex = 0;
                this.footerBox.focus();
                await this.crawler.getBoards();
            }

            this.resetScroll(this.boardsList);
            this.boardsList.setItems(this.getFilteredBoards().map(({ name }) => name));
            this.boardsList.focus();
        } catch (e) {
            this.boardsList.setItems([]);
            this.boardsList.focus();
        }
    }

    getFilteredBoards() {
        const currentBoardType = this.crawler.boardTypes[this.currentBoardTypeIndex];
        return this.crawler.boards.filter(({ type }) => type === currentBoardType);
    }

    async getPosts(index) {
        try {
            this.footerBox.focus();
            this.posts = await this.crawler.changeBoard(this.getFilteredBoards()[index]);
        } catch (e) {
            this.posts = [];
        }
    }

    async refreshPosts() {
        const index = this.getFilteredBoards().indexOf(
            this.crawler.boards[this.crawler.currentBoardIndex]
        );
        await this.getPosts(index);
        this.currentPostIndex = 0;
        this.listList.focus();
    }

    async getPostDetail(index) {
        try {
            this.footerBox.focus();
            this.currentPostIndex = index;

            if (this.posts[index]) {
                this.post = await this.crawler.getPostDetail(this.posts[index].link);
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
            const info = `{${this.colors.comment_top_color}-fg}${author}{|} ${
                upVotes
                    ? `{${this.colors.comment_top_color_likes}-fg}${upVotes}{/${this.colors.comment_top_color_likes}-fg} | `
                    : ''
            }${time}{/}\n`;

            const commentBox = blessed.box({
                parent: this.detailBox,
                top: prevTop,
                width: '100%-1',
                height: parseInt(body.length / this.detailBox.width) + 5,
                content: isRemoved ? body : info + body,
                border: {
                    type: 'line',
                    fg: this.colors.comment_border_color,
                },
                style: {
                    bg: this.colors.comment_bg,
                    fg: this.colors.comment_bottom_color,
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

module.exports = Community;
