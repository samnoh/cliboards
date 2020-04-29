const Crawler = require('../Crawler');

const { getUrl, boards } = require('./constants');

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

            const posts = await this.page.evaluate(() => {
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
                              time: time.innerText.trim().split(' ')[0],
                              link: 'https://clien.net' + link.getAttribute('href'),
                              upVotes: parseInt(upVotes.innerText),
                              numberOfComments: numberOfComments
                                  ? parseInt(numberOfComments.innerText)
                                  : 0,
                          }
                        : null;
                });
            });

            return posts
                .filter((posts) => posts)
                .map(({ title, author, link, upVotes, hit, time, numberOfComments }) => ({
                    // name: `${
                    //     upVotes
                    //         ? chalk.blueBright(`${(' ' + upVotes).slice(-2)}`)
                    //         : chalk.gray.dim(' 0')
                    // } ${d} ${chalk.green.bold(parseEllipsisText(title))} ${
                    //     numberOfComments ? ' ' + chalk.white.dim(numberOfComments) : ''
                    // } ${d} ${chalk.gray(author)} ${d} ${chalk.gray.dim(hit)} ${d} ${chalk.gray.dim(
                    //     time
                    // )}`,
                    name: `${title}`,
                    value: link,
                }));
        } catch (e) {
            console.error(e);
        }
    }

    async getPostDetail(link) {
        try {
            await this.page.goto(link);

            const post = await this.page.evaluate(() => {
                const body = document.querySelector('.post_article');
                const comments = document.querySelectorAll('.comment_row');

                return {
                    body: body.textContent
                        .split('\n')
                        .map((b) => b.trim())
                        .join('\n')
                        .trim(),
                    comments: Array.from(comments).map((comment) => {
                        const body = comment.querySelector('.comment_content');
                        const author = comment.querySelector('.contact_name');
                        const time = comment.querySelector('.comment_time');

                        return {
                            author:
                                author.innerText || author.querySelector('img').getAttribute('alt'),
                            time: time.innerText.split(' ')[0],
                            body: body.innerText || '',
                        };
                    }),
                };
            });

            return post;
        } catch (e) {
            console.error(e);
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
