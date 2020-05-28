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
            await this.changeUserAgent();
            resolve();
        });
    }

    async getPosts() {
        await this.page.goto(getUrl(this.currentBoard.value) + this.currentPageNumber || '');

        const [posts, currentPageNumber] = await this.page.evaluate((baseUrl) => {
            const lists = document.querySelectorAll('.bbs_tbl_layout tr:not(#bhead)');
            const nextPageNumber = document
                .querySelector('.next1')
                .getAttribute('href')
                .split('&page=')
                .pop();

            return [
                Array.from(lists)
                    .slice(0, -2)
                    .map((list) => {
                        const title = list.querySelector('.sbj a');
                        const author = list.querySelector('.list_name');
                        const hit = list.querySelector('.list_click');
                        const time = list.querySelector('.list_date');
                        const upVotes = list.querySelector('.list_vote');
                        const hasImages = list.querySelector('.sbj .li_ic');
                        const numberOfComments = list.querySelector('.sbj').lastChild;

                        const isNotice = list.querySelector('.list_notice');

                        return (
                            !isNotice && {
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
                        );
                    })
                    .filter((post) => post),
                parseInt(nextPageNumber) + 1,
            ];
        }, baseUrl);

        this.currentPageNumber = currentPageNumber;

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

                image.textContent = `${isGif ? 'GIF' : 'IMAGE'}_${index + 1} `;
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
                    const isReply = comment.classList.contains('reply');

                    return {
                        isRemoved: false,
                        isReply,
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

    set navigatePage(offset) {
        this.currentPageNumber -= offset;
    }

    static toString() {
        return 'SLRClub';
    }
}

module.exports = SLRClub;
