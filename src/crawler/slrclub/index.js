const CommunityCrawler = require('../CommunityCrawler');
const {
    baseUrl,
    getUrl,
    sortUrls,
    boardTypes,
    ignoreRequests,
    ignoreBoards,
    boards,
} = require('./constants');

class SLRClub extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.title = SLRClub.toString();
        this.boardTypes = boardTypes;
    }

    async getBoards() {
        return new Promise(async (resolve, reject) => {
            super.getBoards(boards, ignoreBoards);
            await this.changeUserAgent('mobile');
            resolve();
        });
    }

    async getPosts() {
        await this.page.goto(getUrl(this.currentBoard.value) + (this.currentPageNumber || ''));

        const [posts, currentPageNumber] = await this.page.evaluate((baseUrl) => {
            const lists = document.querySelectorAll('.list li:not(.notice)');
            const nextPageNumber = document
                .querySelector('.paging #actpg + a')
                .getAttribute('href')
                .split('/')
                .pop();

            return [
                Array.from(lists).map((list) => {
                    const title = list.querySelector('.subject a');
                    const author = list.querySelector('.article-info span');
                    const infoEl = list.querySelector('.article-info').innerText.split('|');
                    const time = infoEl[1];
                    const hit = infoEl[2].replace(/[^0-9]/g, '');
                    const upVotes = infoEl[3] ? infoEl[3].replace(/[^0-9]/g, '') : 0;
                    const hasImages = list.querySelector('.subject .li_ic');
                    const numberOfComments = list.querySelector('.cmt2');

                    return {
                        category: null,
                        title: title.innerText.trim(),
                        author: author.innerText.trim(),
                        hit: hit,
                        time: time,
                        link: baseUrl + title.getAttribute('href'),
                        upVotes: parseInt(upVotes),
                        numberOfComments: numberOfComments.innerText,
                        hasImages: !!hasImages,
                    };
                }),
                parseInt(nextPageNumber) + 1,
            ];
        }, baseUrl);

        this.currentPageNumber = currentPageNumber;

        return posts.map((post) => ({ ...post, hasRead: this.postsRead.has(post.link) }));
    }

    async getPostDetail(link) {
        await this.page.goto(link);

        const postDetail = await this.page.evaluate(() => {
            const title = document.querySelector('.subject');
            const body = document.querySelector('#userct');
            const author = document.querySelector('.info-wrap span');
            const infoEl = document.querySelector('.info-wrap').innerText.split('|');
            const time = infoEl[1].replace(/[^0-9]/g, '');
            const hit = infoEl[2].replace(/[^0-9]/g, '');
            const upVotes = infoEl[3].replace(/[^0-9]/g, '');
            const numberOfComments = document.querySelector('#cmcnt');

            // handle images
            body.querySelectorAll('img').forEach((image, index) => {
                const src = image.getAttribute('src');
                const isGif = src.slice(-3) === 'gif';

                image.textContent = `${isGif ? 'GIF' : 'IMAGE'}_${index + 1} `;
            });

            return {
                category: null,
                title: title.innerText.trim(),
                body: body.textContent
                    .split('\n')
                    .map((b) => b.trim())
                    .join('\n')
                    .trim(),
                author: author.innerText.trim(),
                hit,
                time,
                upVotes: parseInt(upVotes),
                comments: [],
                numberOfComments: parseInt(numberOfComments.innerText),
            };
        });

        if (postDetail.numberOfComments) {
            postDetail.comments = await this.getComments();
        }

        this.postsRead.add(link); // set post that you read
        return postDetail;
    }

    async getComments() {
        await this.page.waitFor(100);

        const comments = await this.page.evaluate(() => {
            const comments = document.querySelectorAll('.comment_inbox .list li');

            return Array.from(comments).map((comment) => {
                const body = comment.querySelector('.cmt-contents');
                const author = comment.querySelector('.cname');
                const time = comment.querySelector('.cmt_date');
                const upVotes = comment.querySelector('.vote_cnt');
                const isReply = comment.classList.contains('reply');

                return {
                    isRemoved: false,
                    isReply,
                    author: author.innerText,
                    time: time.innerText,
                    body: body.innerText,
                    upVotes: upVotes.innerText.replace(/[^0-9]/g, ''),
                };
            });
        });

        return !comments.length ? await this.getComments() : comments;
    }

    get pageNumber() {
        return this.currentPageNumber;
    }

    set navigatePage(offset) {
        this.currentPageNumber -= offset;
    }

    static toString() {
        return 'SLRClub';
    }
}

module.exports = SLRClub;
