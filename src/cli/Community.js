const blessed = require('blessed');

const CLI = require('./CLI');
const cliOptions = require('./CLIOptions');
const { getCrawler, crawlers } = require('../crawler');
const {
    openUrls,
    openImages,
    resetConfigstore,
    resetCustomTheme,
    customThemeFilePath,
    tempFolderPath,
    clearFolder,
    hasSpoilerWord,
} = require('../helpers');
const { name, version, homepage } = require('../../package.json');

class Community extends CLI {
    constructor() {
        super();

        this.communityList = blessed.list({
            parent: this.bodyBox,
            ...cliOptions.community,
        });
        this.boardsList = blessed.list(cliOptions.board);
        this.listList = blessed.list(cliOptions.postList);
        this.detailBox = blessed.box(cliOptions.postDetail);
        this.autoRefreshInterval = 10; // refresh every 10 seconds; do not make it too low
        this.disableSP = false;
        this.hasSpoiler = false;
        this.autoRefreshTimer = null;
        this.widgets = [
            this.communityList,
            this.boardsList,
            this.listList,
            this.detailBox,
        ];
        this.setAllEvents();
    }

    static async start({ theme, reset, startCrawler, disableSP }) {
        clearFolder(tempFolderPath);

        if (reset && !startCrawler) {
            resetConfigstore();
            resetCustomTheme();
        }

        const community = new Community();

        community.communityList.setItems(crawlers);

        if (theme) {
            openUrls(customThemeFilePath);
            return community.terminate(
                0,
                'Please edit the file in JSON format and restart',
            );
        }

        if (disableSP) {
            community.disableSP = true;
        }

        if (startCrawler) {
            let index = 0;

            if (isNaN(startCrawler)) {
                index = crawlers.findIndex(
                    cralwer =>
                        cralwer.toLowerCase() === startCrawler.toLowerCase(),
                );
            } else {
                index =
                    startCrawler > crawlers.length || startCrawler < 1
                        ? -1
                        : startCrawler - 1;
            }

            if (index === -1) {
                community.communityList.focus();
            } else {
                community.communityList.emit('select', null, index);

                process.nextTick(() => {
                    reset && community.crawler.resetBoards();
                });
            }
        } else {
            community.communityList.focus();
        }

        return community;
    }

    setKeyPressEvent() {
        super.setKeyPressEvent();

        this.communityList.on('keypress', async (_, { full }) => {
            switch (full) {
                case 'o':
                    return await openUrls(homepage);
            }
        });

        this.boardsList.on('keypress', async (_, { full }) => {
            const boardTypesLength = this.crawler.boardTypes.length;
            const index = this.boardsList.getScroll();

            switch (full) {
                case 'a':
                    if (!this.crawler.canAddBoards || this.sortBoardsMode) {
                        return;
                    }

                    this.setTitleContent('링크나 갤러리 ID를 입력하세요');

                    return this.showTextBox(async input => {
                        if (!input) return;

                        this.footerBox.focus();

                        this.textBox.emit('success');

                        try {
                            await this.crawler.addBoard(
                                input,
                                this.crawler.boardTypes[
                                    this.currentBoardTypeIndex
                                ],
                            );
                            this.textBox.destroy();
                            await this.crawler.getBoards();
                            await this.getBoards(
                                this.currentBoardTypeIndex,
                                this.crawler.boards.length,
                            );
                        } catch (e) {
                            this.textBox.emit('failure');
                            this.setTitleFooterContent(
                                '잘못된 입력입니다: ' + e.message,
                            );
                        }
                    });
                case 's':
                    this.sortBoardsMode = !this.sortBoardsMode;
                    if (!this.sortBoardsMode) {
                        this.currItemContent = null;
                        this.crawler.saveBoards();
                    } else {
                        const board = this.getFilteredBoards()[index];
                        this.currItemContent = board && board.name;
                    }
                    return this.boardsList.focus();
                case 'enter':
                case 'c':
                    if (!this.sortBoardsMode) return;

                    this.footerBox.focus();
                    await this.crawler.getBoards();
                    const _index = this.getFilteredBoards().findIndex(
                        board => board.name === this.currItemContent,
                    );
                    await this.getBoards(this.currentBoardTypeIndex, _index);
                    this.sortBoardsMode = false;
                    this.currItemContent = null;
                    return this.boardsList.focus();
                case 'd':
                    if (
                        !this.crawler.canAddBoards ||
                        !this.getFilteredBoards().length ||
                        this.sortBoardsMode
                    )
                        return;

                    this.crawler.deleteBoard(
                        this.getFilteredBoards()[index].value,
                    );
                    return await this.getBoards(
                        this.currentBoardTypeIndex,
                        index,
                    );
                case 'right':
                    if (
                        this.crawler.boardTypes.length < 2 ||
                        this.sortBoardsMode
                    )
                        return;

                    this.currentBoardTypeIndex =
                        (this.currentBoardTypeIndex + 1) % boardTypesLength;
                    return await this.getBoards(this.currentBoardTypeIndex);
                case 'left':
                    if (
                        this.crawler.boardTypes.length < 2 ||
                        this.sortBoardsMode
                    )
                        return;

                    this.currentBoardTypeIndex = this.currentBoardTypeIndex
                        ? this.currentBoardTypeIndex - 1
                        : boardTypesLength - 1;

                    return await this.getBoards(this.currentBoardTypeIndex);
                case 'up':
                case 'down':
                    if (
                        !this.sortBoardsMode ||
                        !this.getFilteredBoards().length ||
                        this.currItemContent ===
                            this.getFilteredBoards()[index].name
                    )
                        return;

                    const offset = full === 'up' ? 1 : -1;

                    const isSwaped = this.crawler.sortBoards(
                        this.crawler.boardTypes[this.currentBoardTypeIndex],
                        index + offset,
                        index,
                    );

                    if (!isSwaped) return;

                    this.boardsList.move(offset);
                    this.boardsList.setItems(
                        this.getFilteredBoards().map(({ name }) => name),
                    );
                    return this.screen.render();
            }
        });

        this.listList.on('keypress', async (_, { name, full, shift }) => {
            if (this.autoRefreshTimer) {
                this.autoRefreshTimer = clearTimeout(this.autoRefreshTimer);
                this.listList.focus();
            }

            if (!this.posts.length) return;

            const prevPageNumber = this.crawler.currentPageNumber;
            const prevPosts = this.posts;
            const prevPostIndex = this.currentPostIndex;

            if (full === 'r') {
                // refresh
            } else if (full === 'c') {
                if (!this.crawler.searchParams.value) return;
                this.crawler.currentPageNumber = 0;
                this.crawler.searchParams = {};
            } else if (full === 'a') {
                this.autoRefreshTimer = setInterval(async () => {
                    await this.refreshPosts();
                }, this.autoRefreshInterval * 1000);
            } else if (name === 's') {
                if (
                    this.crawler.currentBoard.noSortUrl ||
                    !this.crawler.sortUrl
                )
                    return;

                const sortUrlsLength = this.crawler.sortUrls.length;
                let index;

                if (shift) {
                    index = this.crawler.sortListIndex
                        ? this.crawler.sortListIndex - 1
                        : sortUrlsLength - 1;
                } else {
                    index = (this.crawler.sortListIndex + 1) % sortUrlsLength;
                }

                this.crawler.changeSortUrl(index);
            } else if (full === 'w') {
                if (
                    !this.crawler.searchTypes ||
                    !this.crawler.searchTypes.length
                )
                    return;

                this.setTitleContent(
                    '옵션을 선택하세요',
                    this.crawler.title + ' 검색',
                );

                return this.showFormBox(
                    this.crawler.searchTypes,
                    ({ name, value }) => {
                        this.setTitleContent(
                            '키워드를 입력하세요',
                            name + ' 검색',
                        );
                        this.showTextBox(async keyword => {
                            if (!keyword) return;

                            this.footerBox.focus();
                            this.textBox.emit('success');

                            try {
                                this.crawler.currentPageNumber = 0;
                                this.crawler.setSearchParams = {
                                    type: name,
                                    value,
                                    keyword,
                                };

                                await this.refreshPosts();

                                if (this.posts.length === 0) {
                                    this.posts = prevPosts;
                                    this.crawler.pageNumber = prevPageNumber;
                                    throw new Error('결과가 없습니다');
                                }

                                this.textBox.destroy();
                                this.listList.focus();
                            } catch (e) {
                                this.textBox.emit('failure');
                                this.crawler.searchParams = {};
                                this.setTitleFooterContent(
                                    'Error: ' + e.message,
                                    name + ' 검색',
                                );
                            }
                        });
                    },
                );
            } else if (full === 'left' && this.crawler.pageNumber >= 2) {
                if (this.crawler.currentBoard.singlePage) return;
                this.crawler.navigatePage = -1;
            } else if (full === 'right') {
                if (this.crawler.currentBoard.singlePage) return;
                this.crawler.navigatePage = 1;
            } else return;

            await this.refreshPosts();

            if (!this.posts.length) {
                // no more pages -> go back to the previous page
                this.crawler.pageNumber = prevPageNumber;
                this.posts = prevPosts;
                this.currentPostIndex = prevPostIndex;
                this.listList.focus();
            }
        });

        this.detailBox.on('keypress', async (_, { full, shift }) => {
            if (!this.post) return;

            switch (full) {
                case 'v':
                    if (!this.hasSpoiler) return;
                    this.rednerDetailBody(true);
                    return this.detailBox.focus();
                case 'S-r':
                case 'r':
                    if (this.hasSpoiler) return;
                    return await this.refreshPostDetail(shift ? 100 : 0);
                case 'i':
                    if (!this.post.hasImages || this.hasSpoiler) return;

                    this.footerBox.focus();

                    const images = await this.crawler.downloadImages(
                        this.post.images.filter(i => i),
                    );

                    this.detailBox.focus();

                    if (images) {
                        await openImages({
                            communityTitle: this.crawler.title,
                            ...this.post,
                            images,
                        });
                    }
                    return;
                case 'o':
                    if (this.hasSpoiler) return;
                    return await openUrls(
                        this.posts[this.currentPostIndex].link,
                    );
                case 'h':
                case 'left':
                    if (this.currentPostIndex) {
                        this.currentPostIndex -= 1;
                        this.posts[this.currentPostIndex].hasRead = true;
                        await this.refreshPostDetail();
                    } else if (this.crawler.pageNumber > 1) {
                        this.crawler.navigatePage = -1;
                        await this.refreshPosts();
                        this.currentPostIndex = this.posts.length - 1;
                        this.posts[this.currentPostIndex].hasRead = true;
                        await this.refreshPostDetail();
                    }
                    return;
                case 'l':
                case 'right':
                    this.currentPostIndex += 1;

                    if (this.currentPostIndex === this.posts.length) {
                        if (this.crawler.currentBoard.singlePage) {
                            this.currentPostIndex -= 1;
                            return;
                        }

                        const prevPosts = this.posts;
                        this.crawler.navigatePage = 1;

                        await this.refreshPosts();

                        if (this.posts.length) {
                            this.currentPostIndex = 0;
                        } else {
                            // no more pages -> go back to the last page
                            this.crawler.navigatePage = -1;
                            this.currentPostIndex = prevPosts.length - 1;
                            this.posts = prevPosts;
                        }
                    }

                    await this.refreshPostDetail();
                    this.posts[this.currentPostIndex].hasRead = true;
            }
        });
    }

    setSelectEvent() {
        super.setSelectEvent();

        this.communityList.on('select', async (_, index) => {
            let postRead;

            this.footerBox.focus();

            if (this.crawler) {
                postRead = this.crawler.postsRead;
                await this.crawler.close();
            }

            this.crawler = getCrawler(index);

            if (postRead) {
                this.crawler.postsRead = postRead;
            }
            this.screen.title = this.crawler.title;
            await this.crawler.start();
            await this.getBoards(index);
            this.moveToWidget('next');
        });

        this.boardsList.on('select', async (_, index) => {
            if (!this.getFilteredBoards().length) return;
            await this.getPosts(index);
            this.moveToWidget('next');
        });

        this.listList.on('select', async (_, index) => {
            try {
                await this.getPostDetail(index);

                this.posts[index].hasRead = true;
                this.moveToWidget('next', () => this.rednerDetailBody());
            } catch (e) {
                this.moveToWidget('next');
            }
        });
    }

    setFocusEvent() {
        super.setFocusEvent();

        this.communityList.on('focus', () => {
            this.sortBoardsMode = false;
            this.currItemContent = null;
            this.screen.title = '';
            this.setTitleFooterContent(
                '커뮤니티 목록',
                this.isColorsError
                    ? '{gray-fg}Invalid JSON format for color theme - default theme now{/}'
                    : '',
                `o: open GitHub{|}${name} ${version}`,
            );
        });

        this.boardsList.on('focus', () => {
            if (this.autoRefreshTimer) {
                this.autoRefreshTimer = clearTimeout(this.autoRefreshTimer);
            }

            if (this.sortBoardsMode) {
                this.setTitleFooterContent(
                    this.crawler.title,
                    '{blue-fg}정렬하기{/}',
                    'c: cancel, s: save, up/down arrow: move board',
                );
            } else {
                this.crawler.searchParams = {};
                this.currentPostIndex = 0;
                this.crawler.changeSortUrl(0);
                this.setTitleFooterContent(
                    this.crawler.title,
                    this.crawler.boardTypes[this.currentBoardTypeIndex],
                    `${
                        this.crawler.canAddBoards
                            ? 'a: add board, d: delete board'
                            : ''
                    }${
                        this.crawler.boardTypes.length > 1
                            ? 's: sort board, left/right arrow: prev/next page'
                            : ''
                    }`,
                );
            }
        });

        this.listList.on('focus', () => {
            if (!this.posts.length) {
                this.listList.setItems([]);
                return this.setTitleFooterContent('Error');
            }

            this.listList.setItems(
                this.posts.map(
                    ({
                        category,
                        title,
                        numberOfComments,
                        author,
                        hasRead,
                        hasImages,
                    }) =>
                        `${
                            category
                                ? `{${this.colors.list_info_color}-fg}` +
                                  category +
                                  '{/} '
                                : ''
                        }${
                            hasRead
                                ? `{${this.colors.list_read_color}-fg}` +
                                  title +
                                  '{/}'
                                : title
                        } {${this.colors.list_info_color}-fg}${
                            hasImages
                                ? '{underline}' +
                                  numberOfComments +
                                  '{/underline}'
                                : numberOfComments
                        }{/}  {|}{${
                            this.colors.list_right_color
                        }-fg}${author}{/}`,
                ),
            );
            this.resetScroll(this.listList, this.currentPostIndex);

            this.setTitleFooterContent(
                `${this.crawler.boards[this.crawler.currentBoardIndex].name} ${
                    this.crawler.searchParams.keyword
                        ? `{${this.colors.top_left_search_keyword_color}-fg}${this.crawler.searchParams.keyword}{/} {${this.colors.top_left_search_info_color}-fg}${this.crawler.searchParams.type} 검색 결과`
                        : `{${this.colors.top_left_info_color}-fg} ${
                              this.crawler.boardTypes[
                                  this.currentBoardTypeIndex
                              ]
                          }`
                }{/}`,
                `${
                    this.crawler.currentBoard.singlePage
                        ? ''
                        : this.crawler.pageNumber + ' 페이지'
                }${
                    this.crawler.sortUrl && !this.crawler.currentBoard.noSortUrl
                        ? '‧' + this.crawler.sortUrl.name
                        : ''
                }`,
                this.autoRefreshTimer
                    ? `any key: cancel auto refresh{|} {${this.colors.bottom_right_color}-fg}Refresh every ${this.autoRefreshInterval} sec..{/}`
                    : `${
                          this.crawler.searchParams.value
                              ? 'c: cancel search, '
                              : ''
                      }${
                          this.crawler.searchTypes ? 'w: search, ' : ''
                      }r: refresh, a: auto refresh, ${
                          this.crawler.sortUrl ? 's: sort, ' : ''
                      }left/right arrow: prev/next page`,
            );
        });

        this.detailBox.on('focus', () => {
            if (!this.post) {
                this.detailBox.setContent('');
                this.flushComments();
                return this.setTitleFooterContent('Error');
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

            this.setTitleContent(
                `${
                    category
                        ? `{${this.colors.top_info_color}-fg}` +
                          category +
                          '{/} '
                        : ''
                }${title} {${this.colors.top_info_color}-fg}${
                    comments.length
                }{/}`,
                `${author}‧${hit}‧${upVotes}‧${time}`,
            );

            if (this.hasSpoiler) {
                this.setFooterContent('v: view contents');
            } else {
                this.setFooterContent(
                    `r: refresh, o: open, ${
                        hasImages
                            ? `i: view ${images.length} image${
                                  images.length !== 1 ? 's' : ''
                              }, `
                            : ''
                    }left/right arrow: prev/next post`,
                );
            }
        });
    }

    setBlurEvent() {
        super.setBlurEvent();
    }

    async getBoards(index, scrollOffset = 0) {
        try {
            this.currentBoardTypeIndex = index;

            if (!this.crawler.boards.length) {
                this.currentBoardTypeIndex = 0;
                this.footerBox.focus();
                await this.crawler.getBoards();
            }

            this.boardsList.setItems(
                this.getFilteredBoards().map(({ name }) => name),
            );
            this.resetScroll(this.boardsList, scrollOffset);
        } catch (e) {
            this.boardsList.setItems([]);
        } finally {
            this.boardsList.focus();
        }
    }

    getFilteredBoards() {
        const currentBoardType = this.crawler.boardTypes[
            this.currentBoardTypeIndex
        ];

        return this.crawler.boards.filter(
            ({ type }) => type === currentBoardType,
        );
    }

    async getPosts(index) {
        try {
            this.footerBox.focus();
            this.posts = await this.crawler.changeBoard(
                this.getFilteredBoards()[index],
            );
        } catch (e) {
            this.posts = [];
        }
    }

    async refreshPosts() {
        const index = this.getFilteredBoards().indexOf(
            this.crawler.boards[this.crawler.currentBoardIndex],
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
                this.post = await this.crawler.getPostDetail(
                    this.posts[index].link,
                );
            }
        } catch (e) {
            this.post = null;
            throw new Error(e);
        }
    }

    async refreshPostDetail(offsetPrec = 0) {
        try {
            const index = this.currentPostIndex;
            await this.getPostDetail(index);
            this.listList.select(index);
            this.rednerDetailBody();
            this.detailBox.setScrollPerc(offsetPrec);
        } catch (e) {
        } finally {
            this.detailBox.focus();
        }
    }

    rednerDetailBody(_disableSP = false) {
        this.hasSpoiler =
            !_disableSP && !this.disableSP && hasSpoilerWord(this.post.title);

        if (this.hasSpoiler) {
            this.detailBox.setContent(
                '{center}\n\n{inverse}Spoiler protection{/inverse} - press v to view{/center}',
            );
            this.flushComments();
        } else {
            this.detailBox.setContent(
                this.post.body.replace(
                    /(GIF_\d+|IMAGE_\d+|YOUTUBE_\d+)/g,
                    '{inverse}$&{/inverse}',
                ),
            );
            this.renderComments();
        }

        this.detailBox.scrollTo(0);
    }

    renderComments() {
        this.flushComments();

        const { comments } = this.post;

        if (!comments || !comments.length) return;

        let prevTop = this.detailBox.getScreenLines().length + 1;

        this.commentBoxes = comments.map(
            ({
                body,
                isRemoved,
                isReply,
                author,
                time,
                upVotes,
                downVotes,
            }) => {
                const info = `{${
                    this.colors.comment_top_color
                }-fg}${author}{|} ${
                    upVotes
                        ? `{${this.colors.comment_top_color_likes}-fg}${upVotes}{/${this.colors.comment_top_color_likes}-fg}‧`
                        : ''
                }${
                    downVotes
                        ? `{${this.colors.comment_top_color_dislikes}-fg}${downVotes}{/${this.colors.comment_top_color_dislikes}-fg}‧`
                        : ''
                }${time}{/}\n`;

                const commentBox = blessed.box({
                    parent: this.detailBox,
                    top: prevTop,
                    width: '100%-1',
                    height: parseInt(body.length / this.detailBox.width) + 5,
                    content: isRemoved
                        ? body
                        : info +
                          body.replace(
                              /(GIF_\d+|IMAGE_\d+)/g,
                              '{inverse}$&{/inverse}',
                          ),
                    border: {
                        type: 'line',
                        fg: this.colors.comment_border_color,
                    },
                    style: {
                        bg: this.colors.comment_bg,
                        fg: this.colors.comment_bottom_color,
                    },
                    tags: true,
                });

                commentBox.padding.left = isReply * 4;
                commentBox.height = commentBox.getScreenLines().length + 2;
                prevTop += commentBox.height - 1;

                return commentBox;
            },
        );
    }

    flushComments() {
        const { commentBoxes } = this;

        if (commentBoxes) {
            commentBoxes.map(box => box.destroy());
            commentBoxes.length = 0;
        }
    }

    showTextBox(onSubmit) {
        this.textBox = blessed.textbox({
            parent: this.footerBox,
            height: 1,
            width: '100%',
            top: '100%-1',
            left: -2,
            keys: true,
            inputOnFocus: true,
            style: {
                bg: this.colors.text_input_bg,
                fg: this.colors.text_input_color,
            },
            input: true,
        });

        this.textBox.on('cancel', () => {
            this.textBox.destroy();
            this.widgets[this.currentWidgetIndex].focus();
        });

        this.textBox.on('submit', onSubmit);

        this.textBox.on('success', () => {
            this.textBox.style.bg = this.colors.text_input_success_bg;
            this.textBox.style.fg = this.colors.text_input_success_color;
        });

        this.textBox.on('failure', () => {
            this.textBox.style.bg = this.colors.text_input_failure_bg;
            this.textBox.style.fg = this.colors.text_input_failure_color;
            this.textBox.focus();
        });

        this.textBox.on('destroy', () => {
            this.textBox = null;
        });

        this.textBox.focus();
        this.screen.render();
    }

    showFormBox(buttons, callback) {
        if (!buttons.length) return;

        this.formBox = blessed.form({
            parent: this.footerBox,
            height: 1,
            width: '100%',
            top: '100%-1',
            left: -2,
        });

        let left = 0;

        buttons.map(({ name, value }) => {
            const offset = 2;
            const nonDoubleWidthCharsLegnth = name.replace(/[^\+\(\)\s]/g, '')
                .length;
            const width =
                (name.length - nonDoubleWidthCharsLegnth) * 2 +
                nonDoubleWidthCharsLegnth;

            const _button = blessed.button({
                parent: this.formBox,
                content: name,
                width,
                left,
                style: {
                    focus: { fg: this.colors.button_input_focused },
                    fg: this.colors.button_input_color,
                    bg: this.colors.button_input_bg,
                },
            });

            left += width + offset;

            _button.on('keypress', (_, { full }) => {
                switch (full) {
                    case 'tab':
                    case 'l':
                    case 'right':
                        return this.formBox.focusNext();
                    case 'S-tab':
                    case 'h':
                    case 'left':
                        return this.formBox.focusPrevious();
                    case 'c':
                    case 'q':
                    case 'escape':
                        return this.formBox.destroy();
                    case 'enter':
                        return this.formBox.emit('submit', { name, value });
                }
            });
        });

        this.formBox.on('submit', data => {
            this.formBox.children.forEach(child => child.destroy());
            this.formBox.destroy();
            callback && callback(data);
        });

        this.formBox.on('destroy', () => {
            this.formBox = null;
            this.widgets[this.currentWidgetIndex].focus();
        });

        this.formBox.on('focus', () => {
            this.formBox.focusNext();
            this.screen.render();
        });

        this.formBox.focus();
    }
}

module.exports = Community;
