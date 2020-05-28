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

class DCInside extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.title = DCInside.toString();
        this.boardTypes = boardTypes;
        this.canRefreshBoards = true;
    }

    getBoards() {
        return new Promise(async (resolve) => {
            super.getBoards(boards, ignoreBoards);
            await this.changeUserAgent('mobile');
            resolve();
        });
    }

    async getPosts() {
        await this.page.goto(getUrl(this.currentBoard) + this.pageNumber);

        const posts = await this.page.evaluate(() => {
            const lists = document.querySelectorAll('.gall-detail-lst li .gall-detail-lnktb');

            return Array.from(lists)
                .map((list) => {
                    const link = list.querySelector('a.lt').getAttribute('href');
                    const title = list.querySelector('.detail-txt');
                    const category = list.querySelector('.ginfo li:nth-child(1)');
                    const author = list.querySelector('.ginfo li:nth-child(2)');
                    const time = list.querySelector('.ginfo li:nth-child(3)');
                    const hit = list.querySelector('.ginfo li:nth-child(4)');
                    const upVotes = list.querySelector('.ginfo li:nth-child(5)');
                    const numberOfComments = list.querySelector('.ct');
                    const hasImages = list.querySelector('.sp-lst-img');

                    return (
                        title &&
                        title.innerText && {
                            category: category.innerText,
                            title: title.innerText.trim(),
                            author: author.innerText.trim(),
                            hit: hit.innerText.trim().replace(/[^0-9]/),
                            time: time.innerText.trim(),
                            link,
                            upVotes: parseInt(upVotes.innerText.replace(/[^0-9]/)) || 0,
                            numberOfComments: numberOfComments.innerText,
                            hasImages,
                        }
                    );
                })
                .filter((post) => post);
        });

        return posts.map((post) => ({ ...post, hasRead: this.postsRead.has(post.link) }));
    }

    async getPostDetail(link) {
        await this.page.goto(link);

        const postDetail = await this.page.evaluate(() => {
            window.stop();
            const _title = document.querySelector('.gallview-tit-box .tit');
            const author = document.querySelector('.btm .ginfo2 li:nth-child(1)');
            const hit = document.querySelector('.gall-thum-btm .ginfo2 li:nth-child(1)');
            const body = document.querySelector('.thum-txt');
            const upVotes = document.querySelector('.gall-thum-btm .ginfo2 li:nth-child(2)');
            const comments = document.querySelectorAll('.all-comment-lst li');
            const _time = document
                .querySelector('.btm .ginfo2 li:nth-child(2)')
                .innerText.match(/[0-9]{2}:[0-9]{2}/)[0];
            const images = Array.from(body.querySelectorAll('img.txc-image') || []).map((image) =>
                image.getAttribute('src')
            );

            if (body) {
                const scripts = Array.from(body.querySelectorAll('script'));

                scripts.map((script) => script.parentNode.removeChild(script));
            }

            // handle images
            body.querySelectorAll('img.txc-image').forEach((image, index) => {
                image.textContent = `IMAGE_${index + 1} `;
            });

            return {
                title: _title.innerText,
                author: author.innerText.trim(),
                hit: hit.innerText.replace(/[^0-9]/g, ''),
                time: _time,
                body: body.innerText
                    .split('\n')
                    .map((b) => b.trim())
                    .join('\n')
                    .trim(),
                upVotes: parseInt(upVotes.innerText.replace(/[^0-9]/g, '')),
                images,
                hasImages: images.length,
                comments: Array.from(comments)
                    .map((comment) => {
                        const body = comment.querySelector('.txt');
                        const author = comment.querySelector('.nick');
                        const time = comment.querySelector('.date');
                        const isReply = comment.classList.contains('.comment-add');

                        body.querySelectorAll('img').forEach((image, index) => {
                            image.textContent = `IMAGE_${index + 1} `;
                        });

                        return (
                            body && {
                                isReply: !!isReply,
                                isRemoved: false,
                                author: author.innerText,
                                time: time.innerText.match(/[0-9]{2}:[0-9]{2}/)[0],
                                body: body.textContent.trim(),
                            }
                        );
                    })
                    .filter((comment) => comment),
            };
        });

        this.postsRead.add(link); // set post that you read

        return postDetail;
    }

    static toString() {
        return 'DCInside';
    }
}

module.exports = DCInside;
