const fs = require('fs');
const path = require('path');

const axios = require('axios');

const Crawler = require('./Crawler');
const { configstore, clearFolder, tempFolderPath } = require('../helpers');

class CommunityCrawler extends Crawler {
    constructor(sortUrls, ignoreRequests, baseUrl) {
        super(ignoreRequests, baseUrl);

        this.sortUrls = sortUrls;
        this.sortUrlsCache = new Map();
        this.boards = [];
        this.currentBoardIndex = 0;
        this.currentPageNumber = 0;
        this.sortListIndex = 0;
        this.postsRead = new Set();
        this.canAddBoards = false;
        this.searchParams = {};
        this.imageXhrRequired = false;
        this.postLinks = {};
    }

    getBoards(boards, ignoreBoards) {
        let _boards = boards;

        if (configstore.has(this.title)) {
            _boards = configstore.get(this.title);
        } else {
            configstore.set(this.title, boards);
        }

        if (ignoreBoards && ignoreBoards.length) {
            this.boards = _boards.filter(
                board => ignoreBoards.indexOf(board) === -1,
            );
        } else {
            this.boards = _boards;
        }
    }

    async changeBoard(board) {
        this.currentBoard = board;
        return await this.getPosts();
    }

    get pageNumber() {
        return this.currentPageNumber + 1;
    }

    set pageNumber(newPageNumber) {
        this.currentPageNumber = newPageNumber;
    }

    set navigatePage(offset) {
        this.currentPageNumber += offset;
    }

    get sortUrl() {
        return this.sortUrls.length ? this.sortUrls[this.sortListIndex] : '';
    }

    set sortUrl(index) {
        this.sortListIndex = index;
    }

    get currentBoard() {
        return this.boards[this.currentBoardIndex];
    }

    set currentBoard(board) {
        this.currentBoardIndex = this.boards.findIndex(
            _board => _board.value === board.value,
        );
    }

    changeSortUrl(index) {
        this.currentPageNumber = 0;
        this.sortUrl = index;
    }

    async getSortUrls(callback) {
        const currentBoardValue = this.currentBoard.value;

        if (this.sortUrlsCache.has(currentBoardValue)) {
            this.sortUrls = this.sortUrlsCache.get(currentBoardValue);
            return;
        }

        this.sortUrls = await this.page.evaluate(callback);
        this.sortUrlsCache.set(currentBoardValue, this.sortUrls);
    }

    async addBoard(link, value, type, callback) {
        if (link.includes('javascript:')) {
            throw new Error(`Invalid input - ${value}`);
        }

        const response = await this.page.goto(link);
        const status = response.status();

        if (status >= 300) {
            throw new Error(`Response status is ${status}`);
        }

        const name = await this.page.evaluate(callback);
        const exBoard = this.boards.find(b => b.value === value);

        if (!exBoard || !name) {
            configstore.set(this.title, [
                ...this.boards,
                { name, value, type },
            ]);
        } else {
            throw new Error(
                `Duplicated input - ${exBoard.name} on ${exBoard.type}`,
            );
        }
    }

    deleteBoard(value) {
        const index = this.boards.map(({ value }) => value).indexOf(value);
        this.boards.splice(index, 1);
        this.saveBoards();
    }

    sortBoards(type, index, targetIndex) {
        const currentBoard = this.boards.filter(board => board.type === type);

        const selectedBoardIndex = this.boards.findIndex(board => {
            return (
                currentBoard[index] && board.name === currentBoard[index].name
            );
        });
        const targetBoardIndex = this.boards.findIndex(
            board =>
                currentBoard[targetIndex] &&
                board.name === currentBoard[targetIndex].name,
        );

        if (selectedBoardIndex === -1 || targetBoardIndex === -1) return false;

        const temp = this.boards[selectedBoardIndex];
        this.boards[selectedBoardIndex] = this.boards[targetBoardIndex];
        this.boards[targetBoardIndex] = temp;

        return true;
    }

    set setSearchParams({ type, value, keyword }) {
        this.searchParams = {
            type,
            keyword,
            value: this.getSearchParams(value, keyword),
        };
    }

    saveBoards() {
        configstore.set(this.title, this.boards);
    }

    resetBoards() {
        configstore.delete(this.title);
    }

    get currFilterOption() {
        return this.filterOptions.filters[this.filterOptions.activeFilterIndex];
    }

    toggleFilterMode(isBackward = false) {
        let index;

        if (isBackward) {
            index = this.filterOptions.activeFilterIndex
                ? this.filterOptions.activeFilterIndex - 1
                : this.filterOptions.filters.length - 1;
        } else {
            index =
                (this.filterOptions.activeFilterIndex + 1) %
                this.filterOptions.filters.length;
        }

        this.filterOptions.activeFilterIndex = index;
    }

    async downloadImages(images) {
        clearFolder(tempFolderPath);

        if (!this.imageXhrRequired) return images;

        try {
            const requests = images
                .filter(i => i.type !== 'youtube')
                .map(url =>
                    axios.get(url.value, {
                        headers: { Referer: this.page.url() },
                        responseType: 'stream',
                    }),
                );

            return axios.all(requests).then(
                axios.spread((...responses) =>
                    Promise.all(
                        responses.map((res, index) => {
                            const ext = res.data.responseUrl.split('.').pop();

                            return new Promise(resolve => {
                                const file = fs.createWriteStream(
                                    path.join(
                                        tempFolderPath,
                                        index +
                                            '.' +
                                            (ext.length > 4 ? 'jpeg' : ext),
                                    ),
                                );
                                file.on('finish', () =>
                                    file.close(() => resolve(file)),
                                );
                                res.data.pipe(file);
                            });
                        }),
                    ).then(files => {
                        return [
                            ...files.map((file, index) => ({
                                type: 'image',
                                value: file.path.split('/').pop(),
                                name: images[index].name,
                            })),
                            ...images.filter(i => i.type === 'youtube'),
                        ];
                    }),
                ),
            );
        } catch (e) {
            return null;
        }
    }
}

module.exports = CommunityCrawler;
