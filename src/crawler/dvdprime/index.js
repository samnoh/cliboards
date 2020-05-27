const CommunityCrawler = require('../CommunityCrawler');
const { baseUrl, getUrl, sortUrls, boardTypes, ignoreRequests, boards } = require('./constants');

class DVDPrime extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests);

        this.title = DVDPrime.toString();
        this.boardTypes = boardTypes;
        this.canRefreshBoards = true;
    }

    async getBoards() {
        try {
            await this.page.goto(baseUrl); // to get author names
            this.boards = boards;
        } catch (e) {
            throw new Error(e);
        }
    }

    async getPosts() {
        await this.page.goto(getUrl(this.currentBoard.value) + this.pageNumber);

        await this.page.waitFor(300);

        const posts = await this.page.evaluate((baseUrl) => {
            const lists = document.querySelectorAll('.list_table_row');

            return Array.from(lists).map((list) => {
                const category = list.querySelector('.list_category_text');
                const title = list.querySelector('.list_subject_span_pc');
                const author = list.querySelector('.list_table_col_name');
                const hit = list.querySelector('.list_table_col_hit');
                const time = list.querySelector('.list_table_dates');
                const link = list.querySelector('.list_subject_a').getAttribute('href');
                const upVotes = list.querySelector('.list_table_col_recommend');
                const numberOfComments = list.querySelector('.list_comment_new');

                return {
                    category: category.innerText,
                    title: title.innerText.trim(),
                    author: author.innerText.trim(),
                    hit: hit.innerText.trim(),
                    time: time.innerText.trim(),
                    link: baseUrl + link,
                    upVotes: parseInt(upVotes.innerText) || 0,
                    numberOfComments: numberOfComments ? parseInt(numberOfComments.innerText) : 0,
                    hasImages: false,
                };
            });
        }, baseUrl);

        return posts.map((post) => ({ ...post, hasRead: this.postsRead.has(post.link) }));
    }

    async getPostDetail(link) {
        await this.page.goto(link);

        const postDetail = await this.page.evaluate(() => {
            const title = document.querySelector('#writeSubject');
            const author = document.querySelector('#view_nickname .member');
            const hit = document.querySelector('#view_hit');
            const body = document.querySelector('.resContents');
            const upVotes = document.querySelector('#view_recommend_num');
            const comments = document.querySelectorAll('.comment_container');
            const time = document.querySelector('#view_datetime').innerText.split(' ');
            const images = Array.from(body.querySelectorAll('img') || []).map((image) =>
                image.getAttribute('src')
            );

            // handle images
            body.querySelectorAll('img').forEach((image, index) => {
                image.textContent = `IMAGE_${index + 1} `;
            });

            return {
                title: title.innerText,
                author: author.innerText.trim(),
                hit: hit.innerText.trim(),
                time: time[time.length - 1],
                body: body.textContent
                    .split('\n')
                    .map((b) => b.trim())
                    .join('\n')
                    .trim(),
                upVotes: parseInt(upVotes.innerText),
                images,
                hasImages: images.length,
                comments: Array.from(comments).map((comment) => {
                    const body = comment.querySelector('.comment_content');
                    const author = comment.querySelector('.sideview_a');
                    const time = comment.querySelector('.comment_time').innerText.split(' ');
                    const upVotes = comment.querySelector('.comment_title_right .c_r_num');
                    const isReply = comment.querySelector('.comment_reply_line');
                    const spoilerWarning = body.querySelector('.view_warning_div');

                    if (spoilerWarning) {
                        body.removeChild(spoilerWarning);
                    }

                    body.querySelectorAll('.view_image img').forEach((image, index) => {
                        image.textContent = `IMAGE_${index + 1} `;
                    });

                    return {
                        isReply: !!isReply,
                        isRemoved: false,
                        author: author.innerText,
                        time: time[time.length - 1],
                        body: body.textContent.trim(),
                        upVotes: parseInt(upVotes.innerText),
                    };
                }),
            };
        });

        this.postsRead.add(link); // set post that you read

        return postDetail;
    }

    static toString() {
        return 'DVDPrime';
    }
}

module.exports = DVDPrime;
