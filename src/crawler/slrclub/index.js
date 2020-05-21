const Crawler = require('../Crawler');
const {
    baseUrl,
    getUrl,
    sortUrls,
    boardTypes,
    ignoreBoards,
    ignoreRequests,
} = require('./constants');
const { configstore } = require('../../helpers');

class SLRClub extends Crawler {
    constructor() {
        super(ignoreRequests);

        this.title = SLRClub.toString();
        this.boards = [];
        this.boardTypes = boardTypes;
        this.currentBoardIndex = 0;
        this.currentPageNumber = 0;
        this.sortListIndex = 0;
        this.postsRead = new Set();
    }

    async getBoards() {
        try {
            this.boards = [
                {
                    name: '자유게시판',
                    value: 'free',
                    type: this.boardTypes[0],
                },
            ];

            return;
            if (configstore.has(this.title)) {
                this.boards = configstore.get(this.title);
                return;
            }

            await this.page.goto(baseUrl);

            this.boards = await this.page.evaluate((ignoreBoards) => {
                const main = Array.from(document.querySelectorAll('.navmenu a'));
                const sub = Array.from(document.querySelectorAll('.menu_somoim a'));

                const mainBoardSize = main.length;

                return [...main, ...sub]
                    .map((board, index) => {
                        const name = board.querySelectorAll('span')[1];
                        const link = board.getAttribute('href');

                        return link.includes('/service/board') &&
                            ignoreBoards.indexOf(name.innerText) === -1
                            ? {
                                  name: name.innerText,
                                  value: link,
                                  isSub: mainBoardSize < index,
                              }
                            : null;
                    })
                    .filter((board) => board);
            }, ignoreBoards);

            configstore.set(this.title, this.boards);
        } catch (e) {
            this.deleteBoards();
            throw new Error(e);
        }
    }

    async getPosts() {
        await this.page.goto(getUrl(this.currentBoard.value) + this.currentPageNumber || '');

        const [posts, currPageNumber] = await this.page.evaluate((baseUrl) => {
            const lists = document.querySelectorAll('.bbs_tbl_layout tr:not(#bhead)');

            const currPageNumber =
                parseInt(
                    document
                        .querySelector('.next1')
                        .getAttribute('href')
                        .replace(/[^0-9]/g, '')
                ) + 1;

            return [
                Array.from(lists)
                    .slice(1)
                    .slice(0, -2)
                    .map((list) => {
                        const title = list.querySelector('.sbj a');
                        const author = list.querySelector('.list_name');
                        const hit = list.querySelector('.list_click');
                        const time = list.querySelector('.list_date');
                        const upVotes = list.querySelector('.list_vote');
                        const hasImages = list.querySelector('.sbj .li_ic');
                        const numberOfComments = list.querySelector('.sbj').lastChild;

                        return title && title.innerText
                            ? {
                                  category: null,
                                  title: title.innerText.trim(),
                                  author: author.innerText.trim(),
                                  hit: hit.innerText.trim(),
                                  time: time.innerText.trim(),
                                  link: baseUrl + title.getAttribute('href'),
                                  upVotes: parseInt(upVotes.innerText),
                                  numberOfComments:
                                      numberOfComments.textContent.replace(/[^0-9]/g, '') || 0,
                                  hasImages: !!hasImages,
                              }
                            : null;
                    })
                    .filter((posts) => posts),
                currPageNumber,
            ];
        }, baseUrl);

        this.currentPageNumber = currPageNumber;

        return posts.map((post) => ({ ...post, hasRead: this.postsRead.has(post.link) }));
    }

    async getPostDetail(link) {
        await this.page.goto(link);
        await this.page.waitFor(300);
        const postDetail = await this.page.evaluate(() => {
            const title = document.querySelector('.first_part .sbj');
            const author = document.querySelector('.nick span');
            const hit = document.querySelector('.click.bbs_ct_small');
            const body = document.querySelector('#userct');
            const upVotes = document.querySelector('.vote.bbs_ct_small');
            const comments = document.querySelectorAll('.comment_inbox .list li');
            const time = document.querySelector('.date.bbs_ct_small span');
            // const images = Array.from(body.querySelectorAll('img') || []).map((image) =>
            //     image.getAttribute('src')
            // );

            // handle images
            body.querySelectorAll('img').forEach((image, index) => {
                const src = image.getAttribute('src');
                const isGif = src.slice(-3) === 'gif';

                image.textContent = `${isGif ? 'GIF' : 'IMAGE'}_${index} `;
            });

            return {
                category: null,
                title: title.innerText.trim(),
                author: author.innerText.trim(),
                hit: hit.innerText.trim(),
                time: time.innerText.trim().split(' ')[1],
                body: body.textContent
                    .split('\n')
                    .map((b) => b.trim())
                    .join('\n')
                    .trim(),
                upVotes: parseInt(upVotes.innerText),
                comments: Array.from(comments).map((comment) => {
                    const body = comment.querySelector('.cmt-contents');
                    const author = comment.querySelector('.cname');
                    const time = comment.querySelector('.cmt_date');
                    const upVotes = comment.querySelector('.vote_cnt');

                    return {
                        isRemoved: false,
                        isReply: false,
                        author: author.innerText,
                        time: time.innerText.split(' ')[1],
                        body: body.innerText,
                        upVotes: upVotes.innerText.replace(/[^0-9]/g, ''),
                    };
                }),
            };
        });

        this.postsRead.add(link); // set post that you read

        return postDetail;
    }

    get pageNumber() {
        return this.currentPageNumber;
    }

    set pageNumber(newPageNumber) {
        this.currentPageNumber = newPageNumber;
    }

    set navigatePage(offset) {
        this.currentPageNumber -= offset;
    }

    get sortUrl() {
        return sortUrls.length ? sortUrls[this.sortListIndex] : '';
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

    async changeBoard(board) {
        this.currentBoard = board;
        return await this.getPosts();
    }

    changeSortList(index) {
        this.currentPageNumber = 0;
        this.sortUrl = index;
    }

    deleteBoards() {
        configstore.delete(this.title);
    }

    static toString() {
        return 'SLRClub';
    }
}

module.exports = SLRClub;
