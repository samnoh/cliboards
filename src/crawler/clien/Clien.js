const Crawler = require('../Crawler');
const { baseUrl, getUrl } = require('./constants');
const config = require('../../helper/configstore');

class Clien extends Crawler {
    constructor() {
        super();

        this.currentBoardIndex = 0;
        this.currentPageNumber = 0;
        this.boards = [];
    }

    async getBoards() {
        try {
            const boards = config.get('boards');

            if (boards) {
                this.boards = boards;
                return;
            }

            await this.page.goto(baseUrl);

            this.boards = await this.page.evaluate(() => {
                const main = Array.from(document.querySelectorAll('.navmenu a'));
                const sub = Array.from(document.querySelectorAll('.menu_somoim a'));

                const mainLength = main.length;

                return [...main, ...sub]
                    .map((board, index) => {
                        const name = board.querySelectorAll('span')[1];
                        const link = board.getAttribute('href');

                        return link.includes('/service/board') && index !== 3
                            ? {
                                  name: name.innerText,
                                  value: link,
                                  isSub: mainLength < index,
                              }
                            : null;
                    })
                    .filter((board) => board);
            });

            config.set('boards', this.boards);
        } catch (e) {}
    }

    async getPosts(link) {
        try {
            await this.page.goto(
                getUrl(this.boards[this.currentBoardIndex].value) + this.currentPageNumber
            );

            return await this.page.evaluate((baseUrl) => {
                const lists = document.querySelectorAll('.list_content .list_item');

                return Array.from(lists)
                    .map((list) => {
                        const title = list.querySelector('.list_subject .subject_fixed');
                        const link = list.querySelector('.list_subject');
                        const author = list.querySelector('.list_author .nickname');
                        const hit = list.querySelector('.list_hit');
                        const time = list.querySelector('.list_time');
                        const upVotes = list.querySelector('.list_symph');
                        const numberOfComments = list.querySelector('.rSymph05');

                        return title && title.innerText
                            ? {
                                  title: title.innerText.trim(),
                                  author:
                                      author.innerText.trim() ||
                                      author.querySelector('img').getAttribute('alt'),
                                  hit: hit.innerText.trim(),
                                  time: time.innerText.trim(),
                                  link: baseUrl + link.getAttribute('href'),
                                  upVotes: parseInt(upVotes.innerText),
                                  numberOfComments: numberOfComments
                                      ? parseInt(numberOfComments.innerText)
                                      : 0,
                              }
                            : null;
                    })
                    .filter((posts) => posts);
            }, baseUrl);
        } catch (e) {
            return new Error(e);
        }
    }

    async getPostDetail(link) {
        try {
            await this.page.goto(link);

            return await this.page.evaluate(() => {
                const title = document.querySelector('.post_subject span');
                const author = document.querySelector('.post_info .contact_name');
                const hit = document.querySelector('.view_info');
                const body = document.querySelector('.post_article');
                const upVotes = document.querySelector('.symph_count strong');
                const comments = document.querySelectorAll('.comment_row');
                const time = document.querySelector('.post_author span');

                // body.querySelectorAll('img').forEach((image) => {
                //     image.textContent = 'IMAGE';
                // });

                return {
                    title: title.innerText.trim(),
                    author:
                        author.innerText.trim() || author.querySelector('img').getAttribute('alt'),
                    hit: hit.innerText.trim(),
                    time: time.innerText.trim().split(' ')[1],
                    body: body.textContent
                        .split('\n')
                        .map((b) => b.trim())
                        .join('\n')
                        .trim(),
                    upVotes: parseInt(upVotes.innerText),
                    comments: Array.from(comments).map((comment) => {
                        const isRemoved = comment.classList.contains('blocked');
                        const isReply = comment.classList.contains('re');
                        const body = comment.querySelector('.comment_content');
                        const author = comment.querySelector('.contact_name');
                        const time = comment.querySelector('.comment_time .timestamp');
                        const upVotes = comment.querySelector('.comment_symph');
                        const replyTo = body.querySelector('.comment_view strong img');

                        if (isReply && replyTo) {
                            const nickId = document.createTextNode(
                                replyTo.getAttribute('data-nick-id')
                            );

                            replyTo.parentNode.replaceChild(nickId, replyTo);
                        }

                        return isRemoved
                            ? {
                                  isReply,
                                  isRemoved,
                                  body: '삭제 되었습니다.',
                              }
                            : {
                                  isRemoved,
                                  isReply,
                                  author:
                                      author.innerText ||
                                      author.querySelector('img').getAttribute('alt'),
                                  time: time.innerText.split(' ')[1],
                                  body: body.innerText,
                                  upVotes: parseInt(upVotes.innerText.trim()),
                              };
                    }),
                };
            });
        } catch (e) {
            return new Error(e);
        }
    }

    async changeBoard(board) {
        this.currentBoardIndex = this.boards.findIndex((_board) => _board.value === board.value);
        return await this.getPosts();
    }

    async changePageNumber(pageNumber) {
        this.currentPageNumber = pageNumber;
        return await this.getPosts();
    }
}

module.exports = Clien;
