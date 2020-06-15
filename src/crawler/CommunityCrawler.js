const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');
const axios = require('axios');

const Crawler = require('./Crawler');
const { configstore } = require('../helpers');

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
        try {
            if (link.includes('javascript:')) {
                throw new Error('Invalid input');
            }

            const response = await this.page.goto(link);

            if (response.status() >= 300) {
                throw new Error(`Response status is ${response.status()}`);
            }

            const name = await this.page.evaluate(callback);
            const isDuplicate = this.boards.filter(
                board => board.value === value,
            ).length;

            if (!isDuplicate || !name) {
                configstore.set(this.title, [
                    ...this.boards,
                    { name, value, type },
                ]);
            } else {
                throw new Error('Duplicated input');
            }
        } catch (e) {
            throw new Error(e.message);
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

    set setSearchParams({ value, keyword }) {
        this.searchParams = {
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

    async downloadImages(urls) {
        const tempFolderPath = path.resolve(__dirname, '..', '..', 'temp');

        fs.rmdirSync(tempFolderPath, { recursive: true });

        mkdirp.sync(tempFolderPath);

        const requests = urls.map(url =>
            axios.get(url, {
                headers: { Referer: this.page.url() },
                responseType: 'stream',
            }),
        );

        try {
            return axios.all([...requests]).then(
                axios.spread((...resps) =>
                    Promise.all(
                        resps.map((res, index) => {
                            const ext = res.data.responseUrl.split('.').pop();

                            return new Promise(resolve => {
                                const file = fs.createWriteStream(
                                    path.resolve(
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
                    ).then(files =>
                        files.map(file => file.path.split('/').pop()),
                    ),
                ),
            );
        } catch (e) {
            return null;
        }
    }
}

module.exports = CommunityCrawler;
