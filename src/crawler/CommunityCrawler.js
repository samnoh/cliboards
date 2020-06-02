const Crawler = require('./Crawler');
const configstore = require('../helpers/configstore');

class CommunityCrawler extends Crawler {
    constructor(sortUrls, ignoreRequests, baseUrl) {
        super(ignoreRequests, baseUrl);

        this.sortUrls = sortUrls;
        this.boards = [];
        this.currentBoardIndex = 0;
        this.currentPageNumber = 0;
        this.sortListIndex = 0;
        this.postsRead = new Set();
        this.canRefreshBoards = false;
        this.canAddBoards = false;
    }

    getBoards(boards, ignoreBoards) {
        if (ignoreBoards && ignoreBoards.length) {
            this.boards = boards.filter((board) => ignoreBoards.indexOf(board) === -1);
        } else {
            this.boards = boards;
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
        this.currentBoardIndex = this.boards.findIndex((_board) => _board.value === board.value);
    }

    changeSortList(index) {
        this.currentPageNumber = 0;
        this.sortUrl = index;
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
            const isDuplicate = this.boards.filter((board) => board.value === value).length;

            if (!isDuplicate || !name) {
                configstore.set(this.title, [...this.boards, { name, value, type }]);
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

    saveBoards() {
        configstore.set(this.title, this.boards);
    }

    sortBoards(type, index, targetIndex) {
        const currentBoard = this.boards.filter((board) => board.type === type);

        const selectedBoardIndex = this.boards.findIndex((board) => {
            return currentBoard[index] && board.name === currentBoard[index].name;
        });
        const targetBoardIndex = this.boards.findIndex(
            (board) => currentBoard[targetIndex] && board.name === currentBoard[targetIndex].name
        );

        if (selectedBoardIndex === -1 || targetBoardIndex === -1) return false;

        const temp = this.boards[selectedBoardIndex];
        this.boards[selectedBoardIndex] = this.boards[targetBoardIndex];
        this.boards[targetBoardIndex] = temp;

        return true;
    }

    resetBoards() {
        configstore.delete(this.title);
    }
}

module.exports = CommunityCrawler;
