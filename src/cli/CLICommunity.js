const blessed = require('blessed');

const CLI = require('./CLI');
const cliOptions = require('./CLIOptions');
const { getCrawler, crawlers } = require('../crawler');
const {
    openUrls,
    openImages,
    resetConfigstore,
    resetCustomTheme,
    openCustomThemeFile,
    tempFolderPath,
    clearFolder,
    hasSpoilerWord,
    clearFavorites,
    setFavorite,
    getFavorites,
    getFavoriteById,
    deleteFavoritesById,
    clearHistory,
    setHistory,
    isInPostHistory,
    getCurrentHistories,
    openFilterByKeywordsFile,
    resetFilterByKeywordsFile,
    filterByKeywords,
} = require('../helpers');
const { name, version, changelog } = require('../../package.json');

class CLICommunity extends CLI {
    constructor() {
        super();

        // cli
        this.communityList = blessed.list(cliOptions.defaultList);
        this.boardsList = blessed.list(cliOptions.defaultList);
        this.listList = blessed.list(cliOptions.defaultList);
        this.detailBox = blessed.box(cliOptions.postDetail);
        this.widgets = [
            this.communityList,
            this.boardsList,
            this.listList,
            this.detailBox,
        ];

        // options
        this.autoRefreshInterval = 10; // refresh every 10 seconds; do not make it too low
        this.showSpoiler = false;
        this.hideComments = false;
        this.hideTopBar = false;
        this.hideBottomBar = false;
        this.searchKeywordInMode = '';
        this.hasSpoiler = false;
        this.autoRefreshTimer = null;

        this.setAllEvents();
    }

    static async start({
        theme,
        reset,
        startCrawler,
        filter,
        showSpoiler,
        hideComments,
        fullScreen,
        hideTopBar,
        hideBottomBar,
    }) {
        clearFolder(tempFolderPath);

        if (reset && !startCrawler) {
            clearFavorites();
            resetConfigstore();
            resetCustomTheme();
            resetFilterByKeywordsFile();
        }

        const community = new CLICommunity();

        community.bodyBox.append(community.communityList);
        community.communityList.setItems(crawlers);

        if (theme) {
            openCustomThemeFile();
            return community.terminate(
                0,
                'Please edit the file in JSON format and restart',
            );
        }

        if (filter) {
            openFilterByKeywordsFile();
            return community.terminate();
        }

        if (showSpoiler) {
            community.showSpoiler = true;
        }

        if (hideComments) {
            community.hideComments = true;
        }

        if (fullScreen || hideTopBar) {
            community.hideTopBar = true;
            community.titleBox.hide();
            community.bodyBox.top = 0;
        }

        if (fullScreen || hideBottomBar) {
            community.hideBottomBar = true;
            community.footerBox.hide();
        }

        if (fullScreen || hideTopBar || hideBottomBar) {
            if (fullScreen || (hideTopBar && hideBottomBar)) {
                community.bodyBox.height = '100%';
            } else {
                community.bodyBox.height = '100%-1';
            }
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
                    if (reset) {
                        community.crawler.resetBoards();
                        clearFavorites(community.crawler.title);
                    }
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
                case 'c':
                    return await openUrls(changelog);
            }
        });

        this.boardsList.on('keypress', async (_, { full }) => {
            const boardTypesLength = this.crawler.boardTypes.length;
            const index = this.boardsList.selected;

            switch (full) {
                case 'w':
                    if (this.sortBoardsMode) return;

                    this.searchKeywordInMode && this.cancelSearchInMode();

                    this.setTitleContent('검색어를 입력하세요');

                    return this.showTextBox((keyword, textBox) => {
                        textBox.destroy();
                        this.searchKeywordInMode = keyword;
                        this.setBoards(b =>
                            b.name
                                .toLowerCase()
                                .includes(keyword.toLowerCase()),
                        );
                        this.resetScroll(this.boardsList);
                        this.boardsList.focus();

                        this.boardsList.shouldSkip = true;
                    });
                case 'h': // go to history page
                    if (this.sortBoardsMode || this.searchKeywordInMode) return;
                    this.isHistoryMode = true;
                    this.posts = getCurrentHistories(this.crawler.title);
                    return this.moveToWidget('next');
                case 'f': // go to favorite page
                    if (this.sortBoardsMode || this.searchKeywordInMode) return;
                    this.isFavMode = true;
                    this.posts = getFavorites(this.crawler.title);
                    return this.moveToWidget('next');
                case 'a':
                    if (
                        this.sortBoardsMode ||
                        !this.crawler.canAddBoards ||
                        !this.crawler.canUpdateBoard(
                            this.currentBoardTypeIndex,
                        ) ||
                        this.searchKeywordInMode
                    ) {
                        return;
                    }

                    this.setTitleContent('링크나 갤러리 ID를 입력하세요');

                    return this.showTextBox(async (input, textBox) => {
                        this.footerBox.focus();
                        textBox.emit('success');

                        try {
                            await this.crawler.addBoard(
                                input,
                                this.crawler.boardTypes[
                                    this.currentBoardTypeIndex
                                ],
                            );
                            textBox.destroy();
                            await this.crawler.getBoards();
                            await this.getBoards(
                                this.currentBoardTypeIndex,
                                this.crawler.boards.length,
                            );
                        } catch (e) {
                            this.setTitleFooterContent(e.message);
                            throw new Error(e);
                        }
                    });
                case 's':
                    if (
                        (this.crawler.canUpdateBoard &&
                            !this.crawler.canUpdateBoard(
                                this.currentBoardTypeIndex,
                            )) ||
                        this.searchKeywordInMode
                    )
                        return;

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
                        this.sortBoardsMode ||
                        !this.getFilteredBoards().length ||
                        !this.crawler.canAddBoards ||
                        !this.crawler.canUpdateBoard(
                            this.currentBoardTypeIndex,
                        ) ||
                        this.searchKeywordInMode
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
                    this.searchKeywordInMode = '';
                    this.currentBoardTypeIndex =
                        (this.currentBoardTypeIndex + 1) % boardTypesLength;
                    return await this.getBoards(this.currentBoardTypeIndex);
                case 'left':
                    if (
                        this.crawler.boardTypes.length < 2 ||
                        this.sortBoardsMode
                    )
                        return;
                    this.searchKeywordInMode = '';
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
                    this.setBoards();
                    return this.screen.render();
            }
        });

        this.listList.on('keypress', async (_, { name, full, shift, ctrl }) => {
            if (this.autoRefreshTimer) {
                this.autoRefreshTimer = clearTimeout(this.autoRefreshTimer);
                this[full === 'enter' ? 'footerBox' : 'listList'].focus();
            }

            if (this.isHistoryMode) {
                if (full === 'r' && !this.searchKeywordInMode) {
                    this.footerBox.focus();
                    clearHistory(this.crawler.title);
                    this.posts = [];
                    setTimeout(() => this.listList.focus(), 250);
                }
            }

            if (this.isFavMode) {
                if (full === 'd' && this.posts.length) {
                    this.footerBox.focus();
                    const keyword = this.searchKeywordInMode;

                    const currentIndex = this.listList.selected;
                    const id = this.posts[currentIndex].id;

                    const newPosts = deleteFavoritesById(
                        this.crawler.title,
                        id,
                    );

                    this.currentPostIndex = currentIndex;
                    this.posts = keyword
                        ? newPosts.filter(({ title }) =>
                              title
                                  .toLowerCase()
                                  .includes(keyword.toLowerCase()),
                          )
                        : newPosts;

                    setTimeout(() => this.listList.focus(), 250);
                }
            }

            if (this.isFavMode || this.isHistoryMode) {
                if (full === 'w') {
                    this.searchKeywordInMode && this.cancelSearchInMode();

                    this.setTitleContent('검색어를 입력하세요');

                    this.showTextBox((keyword, textBox) => {
                        this.searchKeywordInMode = keyword;
                        const originalPosts = this.isFavMode
                            ? getFavorites(this.crawler.title)
                            : getCurrentHistories(this.crawler.title);

                        this.posts = originalPosts.filter(({ title }) =>
                            title.toLowerCase().includes(keyword.toLowerCase()),
                        );
                        this.currentPostIndex = 0;
                        textBox.destroy();
                    });
                }
                return;
            }

            if (!this.posts.length) return;

            const prevPageNumber = this.crawler.currentPageNumber;
            const prevPosts = this.posts;
            const prevPostIndex = this.currentPostIndex;
            let passPrevPosts = false;

            if (full === 'r') {
                // refresh
                passPrevPosts = true;
            } else if (full === 'a') {
                passPrevPosts = true;

                this.autoRefreshTimer = setInterval(async () => {
                    await this.refreshPosts(prevPosts);
                }, this.autoRefreshInterval * 1000);
            } else if (name === 's') {
                if (ctrl && this.crawler.filterOptions) {
                    this.crawler.toggleFilterMode();
                } else {
                    if (
                        this.crawler.currentBoard.noSortUrl ||
                        !this.crawler.sortUrl
                    ) {
                        return;
                    }

                    const sortUrlsLength = this.crawler.sortUrls.length;
                    let index;

                    if (shift) {
                        index = this.crawler.sortListIndex
                            ? this.crawler.sortListIndex - 1
                            : sortUrlsLength - 1;
                    } else {
                        index =
                            (this.crawler.sortListIndex + 1) % sortUrlsLength;
                    }
                    this.crawler.changeSortUrl(index);
                }
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
                            '검색어를 입력하세요',
                            name + ' 검색',
                        );
                        this.showTextBox(async (keyword, textBox) => {
                            this.footerBox.focus();
                            textBox.emit('success');

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
                                textBox.destroy();
                            } catch (e) {
                                this.crawler.searchParams = {};
                                this.setTitleFooterContent(
                                    'Error: ' + e.message,
                                    name + ' 검색',
                                );

                                throw new Error(e);
                            }
                        });
                    },
                );
            } else if (
                (full === 'left' || full === 'S-left') &&
                this.crawler.pageNumber > 1
            ) {
                if (this.crawler.currentBoard.singlePage) return;
                this.crawler.navigatePage = shift ? -5 : -1;
                if (this.crawler.currentPageNumber < 1) {
                    this.crawler.currentPageNumber = 0;
                }
            } else if (full === 'right' || full === 'S-right') {
                if (this.crawler.currentBoard.singlePage) return;
                this.crawler.navigatePage = shift ? 5 : 1;
            } else return;

            await this.refreshPosts(passPrevPosts ? prevPosts : null);

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
                case 'd': // to delete this post from favorite list
                    if (!getFavoriteById(this.crawler.title, this.post.id))
                        return;

                    this.footerBox.focus();
                    deleteFavoritesById(this.crawler.title, this.post.id);
                    return setTimeout(() => this.detailBox.focus(), 250);
                case 'a': // to add this post to favorite list
                    if (getFavoriteById(this.crawler.title, this.post.id))
                        return;

                    this.footerBox.focus();
                    setFavorite(
                        this.crawler.title,
                        this.crawler.currentBoard,
                        this.post,
                    );
                    return setTimeout(() => this.detailBox.focus(), 250);
                case 'v': //to cancel SP
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
                        this.setHasRead(true);
                        await this.refreshPostDetail();
                    } else if (this.crawler.pageNumber > 1) {
                        this.crawler.navigatePage = -1;
                        await this.refreshPosts();
                        this.currentPostIndex = this.posts.length - 1;
                        this.setHasRead(true);
                        await this.refreshPostDetail();
                    }
                    return;
                case 'l':
                case 'right':
                    this.currentPostIndex += 1;

                    if (this.currentPostIndex === this.posts.length) {
                        if (
                            this.crawler.currentBoard.singlePage ||
                            this.isFavMode ||
                            this.isHistoryMode
                        ) {
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

                    this.setHasRead(true);
            }
        });
    }

    setSelectEvent() {
        super.setSelectEvent();

        this.communityList.on('select', async (_, index) => {
            this.footerBox.focus();

            if (this.crawler) {
                await this.crawler.close();
            }

            this.crawler = getCrawler(index);
            this.screen.title = this.crawler.title;
            await this.crawler.start();
            await this.getBoards(index);
            this.moveToWidget('next');
        });

        this.boardsList.on('select', async (_, index) => {
            if (!this.getFilteredBoards().length) return;

            if (this.searchKeywordInMode) {
                const results = this.getFilteredBoards().indexOf(
                    this.getFilteredBoards().filter(b =>
                        b.name
                            .toLowerCase()
                            .includes(this.searchKeywordInMode.toLowerCase()),
                    )[index],
                );

                if (results !== -1) {
                    await this.getPosts(results);
                    this.moveToWidget('next');
                }
            } else {
                await this.getPosts(index);
                this.moveToWidget('next');
            }
        });

        this.listList.on('select', async (_, index) => {
            try {
                await this.getPostDetail(index);

                this.setHasRead(true);
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
                    ? 'Invalid JSON format for color theme - default theme now'
                    : this.hideComments || this.showSpoiler
                    ? `${this.hideComments ? 'hideComments' : ''}${
                          this.hideComments && this.showSpoiler ? ', ' : ''
                      }${this.showSpoiler ? 'showSpoiler' : ''}`
                    : '',
                `c: changelog{|}{${this.colors.bottom_right_color}-fg}${name} ${version}{/}`,
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
                if (this.crawler.filterOptions) {
                    this.crawler.filterOptions.activeFilterIndex = 0;
                }
                this.crawler.searchParams = {};
                this.crawler.changeSortUrl(0);
                this.currentPostIndex = 0;
                this.isFavMode = false;
                this.isHistoryMode = false;
                this.screen.debug(this.boardsList.items.length);
                this.setTitleFooterContent(
                    `${this.crawler.title} ${
                        this.searchKeywordInMode
                            ? `{${this.colors.top_left_search_info_color}-fg}${this.searchKeywordInMode} 검색 결과{/} {${this.colors.top_right_color}-fg}${this.boardsList.items.length}{/}`
                            : ''
                    }`,
                    this.crawler.boardTypes[this.currentBoardTypeIndex],
                    `w: search, ${
                        this.searchKeywordInMode
                            ? ''
                            : 'f: favorite, h: history, '
                    }${
                        this.crawler.canAddBoards &&
                        this.crawler.canUpdateBoard(
                            this.currentBoardTypeIndex,
                        ) &&
                        !this.searchKeywordInMode
                            ? 'a: add board, d: delete board, '
                            : ''
                    }${
                        (this.crawler.canUpdateBoard &&
                            !this.crawler.canUpdateBoard(
                                this.currentBoardTypeIndex,
                            )) ||
                        this.searchKeywordInMode
                            ? ''
                            : 's: sort board, '
                    }${
                        this.crawler.boardTypes.length > 1
                            ? 'left/right arrow: prev/next page'
                            : ''
                    }`,
                );
            }
        });

        this.listList.on('focus', () => {
            this.listList.shouldSkip =
                this.searchKeywordInMode || this.crawler.searchParams.value;

            if (
                !Array.isArray(this.posts) ||
                (!this.posts.length && !this.isFavMode && !this.isHistoryMode)
            ) {
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
                        isNewPost,
                    }) =>
                        `${
                            isNewPost
                                ? `{${this.colors.list_new_post_color}-bg} {/}`
                                : ' '
                        }${
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
                            numberOfComments || ''
                        }{/}{|} {${
                            this.colors.list_right_color
                        }-fg}${author}{/}`,
                ),
            );
            this.resetScroll(this.listList, this.currentPostIndex);

            if (this.isHistoryMode || this.isFavMode) {
                return this.setTitleFooterContent(
                    `${this.isHistoryMode ? 'Post History' : 'Favorites'} ${
                        this.searchKeywordInMode
                            ? `{${this.colors.top_left_search_info_color}-fg}${this.searchKeywordInMode} 검색 결과 `
                            : ''
                    }{/}{${this.colors.top_right_color}-fg}${
                        this.posts.length
                    }{/}`,
                    this.crawler.title,
                    this.isHistoryMode
                        ? `${
                              this.searchKeywordInMode ? '' : 'r: reset, '
                          }w: search`
                        : 'd: delete, w: search',
                );
            }

            this.setTitleFooterContent(
                `${this.crawler.currentBoard.name} ${
                    this.crawler.searchParams.keyword
                        ? `{${this.colors.top_left_search_keyword_color}-fg}${this.crawler.searchParams.keyword}{/} {${this.colors.top_left_search_info_color}-fg}${this.crawler.searchParams.type} 검색 결과`
                        : `{${this.colors.top_left_info_color}-fg}${
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
                    this.crawler.filterOptions
                        ? '‧' + this.crawler.currFilterOption.name
                        : ''
                }${
                    this.crawler.sortUrl && !this.crawler.currentBoard.noSortUrl
                        ? '‧' + this.crawler.sortUrl.name
                        : ''
                }`,
                this.autoRefreshTimer
                    ? `any key: cancel auto refresh{|} {${this.colors.bottom_right_color}-fg}Refresh every ${this.autoRefreshInterval} sec..{/}`
                    : `${this.crawler.searchTypes ? 'w: search, ' : ''}${
                          this.crawler.currentBoard.isFav
                              ? ''
                              : 'r: refresh, a: auto refresh, '
                      }${
                          this.crawler.sortUrl &&
                          !this.crawler.currentBoard.noSortUrl
                              ? 's: sort, '
                              : ''
                      }${
                          this.crawler.filterOptions ? 'C-s: filter, ' : ''
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
                downVotes,
                comments,
                time,
                images,
                hasImages,
            } = this.post;

            this.setTitleContent(
                `{${this.colors.top_info_likes}-fg}${
                    upVotes ? upVotes + ' ' : ''
                }{/}{${this.colors.top_info_dislikes}-fg}${
                    downVotes ? downVotes + ' ' : ''
                }{/}${
                    category
                        ? `{${this.colors.top_info_color}-fg}` +
                          category +
                          '{/} '
                        : ''
                }${title} {${this.colors.top_info_color}-fg}${
                    (comments && comments.length) || ''
                }{/}`,
                `${author}|${hit}|${time}`,
            );

            if (this.hasSpoiler) {
                this.setFooterContent('v: view contents');
            } else {
                this.setFooterContent(
                    `r: refresh, ${
                        getFavoriteById(this.crawler.title, this.post.id)
                            ? 'd: del from'
                            : 'a: add to'
                    } favorites, o: open, ${
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

        this.detailBox.on('blur', () => {
            this.posts = this.posts.map(p => {
                return { ...p, isNewPost: p.hasRead ? false : p.isNewPost };
            });

            // update if post is deleted
            if (this.isFavMode) {
                const favs = getFavorites(this.crawler.title);

                this.posts = this.searchKeywordInMode
                    ? favs.filter(({ title }) =>
                          title
                              .toLowerCase()
                              .includes(this.searchKeywordInMode.toLowerCase()),
                      )
                    : favs;
            }
        });
    }

    async getBoards(index, scrollOffset = 0) {
        try {
            this.currentBoardTypeIndex = index;

            if (!this.crawler.boards.length) {
                this.currentBoardTypeIndex = 0;
                this.footerBox.focus();
                await this.crawler.getBoards();
            }

            this.setBoards();

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

    setBoards(filterCallback) {
        const filteredBoards = this.getFilteredBoards();
        const renderBoards = (boards = filteredBoards) =>
            boards.map(
                ({ name, subName }) =>
                    `${name}${
                        subName
                            ? '{|}{' +
                              this.colors.list_right_color +
                              '-fg}' +
                              subName
                            : ''
                    }`,
            );
        this.boardsList.setItems(
            filterCallback
                ? renderBoards(filteredBoards.filter(b => filterCallback(b)))
                : renderBoards(),
        );
        this.screen.render();
    }

    async getPosts(index, filtreredBoard = []) {
        try {
            this.footerBox.focus();
            const title = this.crawler.title;
            const posts = await this.crawler.changeBoard(
                filtreredBoard[index] || this.getFilteredBoards()[index],
            );
            this.posts = posts
                .map(p => ({
                    ...p,
                    hasRead: isInPostHistory(title, p.id),
                }))
                .filter(p => filterByKeywords(p.title));
        } catch (e) {
            this.posts = [];
        }
    }

    async refreshPosts(prevPosts) {
        const filtreredBoard = this.getFilteredBoards();
        const index = filtreredBoard.indexOf(
            this.crawler.boards[this.crawler.currentBoardIndex],
        );
        await this.getPosts(index, filtreredBoard);

        if (prevPosts) {
            this.posts = this.posts.map(post => {
                if (!prevPosts.find(p => p.id === post.id)) {
                    post.isNewPost = true;
                }
                return post;
            });
        }

        this.currentPostIndex = 0;
        this.listList.focus();
    }

    async getPostDetail(index) {
        try {
            this.footerBox.focus();
            this.currentPostIndex = index;

            const currPost = this.posts[index];

            if (currPost) {
                this.post = await this.crawler.getPostDetail(
                    currPost,
                    this.hideComments,
                );

                const { title, comments } = this.post;

                if (!this.isFavMode && !this.isHistoryMode) {
                    // save history; post.hasRead is true now
                    setHistory(
                        this.crawler.title,
                        this.crawler.currentBoard,
                        this.post,
                    );
                    // update changed title and number of comments
                    currPost.title = title;

                    if (!this.hideComments) {
                        currPost.numberOfComments = comments.length;
                    }
                }
            }
        } catch (e) {
            this.post = null;
            throw new Error(e);
        }
    }

    async refreshPostDetail(offsetPrec = 0) {
        try {
            const prevPost = this.post;
            const index = this.currentPostIndex;

            await this.getPostDetail(index);

            const isSamePost = prevPost.id === this.post.id;

            if (isSamePost && !this.isFavMode && !this.isHistoryMode) {
                this.post.comments = this.post.comments.map(comment => {
                    if (!prevPost.comments.find(c => c.id === comment.id)) {
                        comment.isNewComment = true;
                    }
                    return comment;
                });
            }

            this.listList.select(index);
            this.rednerDetailBody(isSamePost);
        } catch (e) {
        } finally {
            this.detailBox.focus();
            this.detailBox.setScrollPerc(offsetPrec);
            this.screen.render();
        }
    }

    rednerDetailBody(_disableSP = false) {
        this.hasSpoiler =
            !_disableSP && !this.showSpoiler && hasSpoilerWord(this.post.title);

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

        const commentBoxStyle = {
            width: '100%-1',
            parent: this.detailBox,
            border: {
                type: 'line',
                fg: this.colors.comment_border_color,
            },
            style: {
                bg: this.colors.comment_bg,
                fg: this.colors.comment_bottom_color,
            },
            tags: true,
        };

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
                isNewComment,
            }) => {
                const info = `${
                    isNewComment
                        ? `{${this.colors.comment_new_color}-fg}‧{/}`
                        : ''
                }{${this.colors.comment_top_color}-fg}${author}{|} ${
                    upVotes
                        ? `{${this.colors.comment_top_color_likes}-fg}${upVotes}{/${this.colors.comment_top_color_likes}-fg}‧`
                        : ''
                }${
                    downVotes
                        ? `{${this.colors.comment_top_color_dislikes}-fg}${downVotes}{/${this.colors.comment_top_color_dislikes}-fg}‧`
                        : ''
                }${time}{/}\n`;

                const commentBox = blessed.box({
                    top: prevTop,
                    content: isRemoved
                        ? body
                        : info +
                          body.replace(
                              /(GIF_\d+|IMAGE_\d+)/g,
                              '{inverse}$&{/inverse}',
                          ),
                    ...commentBoxStyle,
                });

                if (isReply) {
                    commentBox.width = `100%-${1 + isReply * 4}`;
                    commentBox.right = 1;
                }

                const commentBoxWidth = commentBox.width;
                const baseHeight = 2; // border lines
                const infoHeight = isRemoved
                    ? 0
                    : Math.ceil(commentBox.strWidth(info) / commentBoxWidth);
                let finalHeight = baseHeight + infoHeight;

                body.split('\n').map(line => {
                    const bodyHegiht =
                        Math.ceil(
                            commentBox.strWidth(line) / commentBoxWidth,
                        ) || 1;
                    finalHeight += bodyHegiht;
                });

                commentBox.height = finalHeight;
                prevTop += finalHeight - 1;
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
        if (this.listList.focused) {
            this.currentPostIndex = this.listList.selected;
        }

        const textBox = blessed.textbox({
            parent: this.footerBox,
            height: 1,
            width: '100%+1',
            top: '100%-1',
            left: -1,
            keys: true,
            inputOnFocus: true,
            style: {
                bg: this.colors.text_input_bg,
                fg: this.colors.text_input_color,
            },
            input: true,
        });

        textBox.on('cancel', () => {
            textBox.destroy();
        });

        textBox.on('submit', async input => {
            if (!input) return textBox.destroy();

            try {
                await onSubmit(input, textBox);
            } catch (e) {
                textBox.emit('failure');
            }
        });

        textBox.on('success', () => {
            textBox.style.bg = this.colors.text_input_success_bg;
            textBox.style.fg = this.colors.text_input_success_color;
            this.screen.render();
        });

        textBox.on('failure', () => {
            textBox.style.bg = this.colors.text_input_failure_bg;
            textBox.style.fg = this.colors.text_input_failure_color;
            textBox.focus();
        });

        textBox.on('destroy', () => {
            this.getWidget().focus();
            this.hideBottomBar && this.footerBox.hide();
        });

        this.footerBox.show();
        textBox.focus();
        this.screen.render();
    }

    showFormBox(buttons, onSubmit) {
        if (!buttons.length) return;

        this.formBox = blessed.form({
            parent: this.footerBox,
            height: 1,
            width: '100%+1',
            top: '100%-1',
            left: -1,
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

        this.formBox.on('submit', async input => {
            this.formBox.children.forEach(child => child.destroy());
            this.formBox.destroy();
            onSubmit && (await onSubmit(input, this.formBox));
        });

        this.formBox.on('destroy', () => {
            this.formBox = null;
            this.getWidget().focus();
            this.hideBottomBar && this.footerBox.hide();
        });

        this.formBox.on('focus', () => {
            this.formBox.focusNext();
            this.screen.render();
        });

        this.footerBox.show();
        this.formBox.focus();
    }

    setHasRead(hasRead) {
        if (!this.posts.length) return;
        else if (!this.isFavMode && !this.isHistoryMode) {
            this.posts[this.currentPostIndex].hasRead = hasRead;
        }
    }

    // hide search results in history & favorites mode
    async cancelSearchInMode() {
        const currentWidget = this.getWidget();
        currentWidget.shouldSkip = false;

        if (this.boardsList.focused) {
            this.searchKeywordInMode = '';
            this.setBoards();
        } else if (this.listList.focused) {
            const crawlerTitle = this.crawler.title;

            if (this.isFavMode) {
                this.searchKeywordInMode = '';
                this.posts = getFavorites(crawlerTitle);
            } else if (this.isHistoryMode) {
                this.searchKeywordInMode = '';
                this.posts = getCurrentHistories(crawlerTitle);
            } else if (this.crawler.searchParams.value) {
                this.crawler.currentPageNumber = 0;
                this.crawler.searchParams = {};
                await this.refreshPosts();
            } else {
                return this.moveToWidget('prev');
            }
        } else {
            return this.moveToWidget('prev');
        }

        currentWidget.focus();
        this.resetScroll(currentWidget);
        this.screen.render();
    }
}

module.exports = CLICommunity;
