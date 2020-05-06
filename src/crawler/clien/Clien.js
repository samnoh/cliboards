const Crawler = require('../Crawler');

const { baseUrl, getUrl, boards } = require('./constants');

class Clien extends Crawler {
    constructor() {
        super();

        this.currentBoardIndex = 0;
        this.currentPageNumber = 0;
    }

    async getPosts() {
        try {
            await this.page.goto(
                getUrl(boards[this.currentBoardIndex].value) + this.currentPageNumber
            );

            const posts = await this.page.evaluate((baseUrl) => {
                const lists = document.querySelectorAll('.list_content .list_item');

                return Array.from(lists).map((list) => {
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
                });
            }, baseUrl);

            return posts.filter((posts) => posts);
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
                        const time = comment.querySelector('.comment_time');
                        const upVotes = comment.querySelector('.comment_symph');

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
                                  time: time.innerText.split(' ')[0],
                                  body: body.innerText || '',
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
        this.currentBoardIndex = boards.findIndex((_board) => _board.value === board.value);
        return await this.getPosts();
    }

    async changePageNumber(pageNumber) {
        this.currentPageNumber = pageNumber;
        return await this.getPosts();
    }
}

module.exports = Clien;
