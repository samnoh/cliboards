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

class Ppomppu extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.title = Ppomppu.toString();
        this.boardTypes = boardTypes;
        this.canAddBoards = true;
    }

    getBoards() {
        return new Promise(async (resolve) => {
            await this.changeUserAgent('mobile');
            super.getBoards(boards, ignoreBoards);
            resolve();
        });
    }

    async getPosts() {
        await this.page.goto(getUrl(this.currentBoard.value, this.pageNumber, this.sortUrl.value));

        const posts = await this.page.evaluate((baseUrl) => {
            const lists = document.querySelectorAll('.bbsList li a');

            if (lists.length) {
                return Array.from(lists)
                    .map((list) => {
                        const title = list.querySelector('strong');
                        const author = list.querySelector('.ct');
                        const time = list.querySelector('.b');
                        const numberOfComments = list.querySelector('.rp');

                        const infoEl = list
                            .querySelector('.hi')
                            .innerText.split('/')
                            .map((el) => el.replace(/[^0-9]/g, ''));

                        const hit = infoEl[0];
                        const upVotes = infoEl[1];
                        const downVotes = infoEl[2];

                        return (
                            author &&
                            author.innerText && {
                                title: title.innerText.trim(),
                                link: baseUrl + '/new/' + list.getAttribute('href'),
                                author: author.innerText.trim(),
                                hit,
                                time: time.innerText.trim(),
                                upVotes: parseInt(upVotes),
                                downVotes: parseInt(downVotes),
                                numberOfComments: numberOfComments
                                    ? parseInt(numberOfComments.innerText)
                                    : 0,
                            }
                        );
                    })
                    .filter((post) => post);
            } else {
                const bbs = document.querySelector('.bbsList_new');
                const lists2 = bbs.querySelectorAll('li a');

                return Array.from(lists2).map((list) => {
                    const category = list.querySelector('.exp span.ty');
                    const title = list.querySelector('.title .cont');
                    const author = list.querySelector('.names');
                    const time = list.querySelector('time');
                    const numberOfComments = list.querySelector('.title .rp');

                    const infoEl = list
                        .querySelector('.exp span:last-child')
                        .innerText.split('/')
                        .map((el) => el.replace(/[^0-9]/g, ''));

                    const hit = infoEl[0];
                    const upVotes = infoEl[1];
                    const downVotes = infoEl[2];

                    return {
                        category: category.innerText,
                        title: title.innerText.trim(),
                        link: baseUrl + '/new/' + list.getAttribute('href'),
                        time: time.innerText,
                        author: author.innerText,
                        hit,
                        upVotes: parseInt(upVotes),
                        downVotes: parseInt(downVotes),
                        numberOfComments: numberOfComments
                            ? parseInt(numberOfComments.innerText)
                            : 0,
                    };
                });
            }
        }, baseUrl);

        return posts.map((post) => ({ ...post, hasRead: this.postsRead.has(post.link) }));
    }

    async getPostDetail(link) {
        await this.page.goto(link);

        const postDetail = await this.page.evaluate(() => {
            const h4 = document.querySelector('h4');
            const listComment = h4.querySelector('.list_comment');
            listComment && h4.removeChild(listComment.parentNode);

            const infoEl = document.querySelector('h4').innerText.split('\n');
            const _title = infoEl[0];
            const author = infoEl[1].split(' ')[0];

            const hi = document.querySelector('.hi').innerText.split('|');

            let category;

            if (hi.length === 2) {
                category = hi[0].trim();
            }

            const time = document.querySelector('.hi').innerText.match(/[0-9]{2}:[0-9]{2}/)[0];

            const otherInfoEl = infoEl[1].trim().split(' ');
            const hit = otherInfoEl[otherInfoEl.indexOf('조회') + 2];
            const upVotes = otherInfoEl[otherInfoEl.indexOf('추천') + 2];

            const body = document.querySelector('#KH_Content');
            const images = body.querySelectorAll('img');
            const comments = document.querySelectorAll('.cmAr .sect-cmt');

            // handle images
            images.forEach((image, index) => {
                const text = document.createElement('span');
                text.innerText = `IMAGE_${index + 1} `;
                image.insertAdjacentElement('afterend', text);
            });

            body.querySelectorAll('a:not(.noeffect)').forEach((link) => {
                const text = document.createElement('span');
                text.innerText = link.getAttribute('href');
                link.parentNode.insertAdjacentElement('afterend', text);
                body.removeChild(link.parentNode);
            });

            return {
                title: _title,
                category,
                author,
                hit: parseInt(hit),
                time,
                body: body.innerText
                    .split('\n')
                    .map((b) => b.trim())
                    .join('\n')
                    .trim(),
                upVotes: parseInt(upVotes),
                images: Array.from(images).map((image) => 'http:' + image.getAttribute('src')),
                hasImages: images.length,
                comments: Array.from(comments).map((comment) => {
                    const body = comment.querySelector('.comment_memo td');
                    const author = comment.querySelector('.com_name span');
                    const time = comment.querySelector('.cin_02 span');
                    const isReply = parseInt(comment.classList[0].replace('sect', ''));

                    body.querySelectorAll('img').forEach((image, index) => {
                        image.textContent = `IMAGE_${index + 1} `;
                    });

                    body.querySelectorAll('a:not(.noeffect)').forEach((link) => {
                        const text = document.createElement('span');
                        text.innerText = link.getAttribute('href');
                        link.parentNode.insertAdjacentElement('afterend', text);
                        body.removeChild(link.parentNode);
                    });

                    return {
                        isReply,
                        isRemoved: false,
                        author: author.innerText.trim(),
                        time: time.innerText.match(/[0-9]{2}:[0-9]{2}/)[0],
                        body: body.textContent.trim(),
                    };
                }),
            };
        });

        this.postsRead.add(link); // set post that you read

        return postDetail;
    }

    async addBoard(link, type) {
        try {
            if (!link) return;

            let value = '';

            if (!link.includes(baseUrl + '/board/')) {
                value = querystring.parse(link.split('?').pop()).id || link;
            } else {
                value = link.replace(/\?.*$/, '').split('/').pop();
            }

            const getNameCallback = () => document.querySelector('.gall-tit-lnk').innerText;

            await super.addBoard(getUrl(value), value, type, getNameCallback);
        } catch (e) {
            throw new Error(e.message);
        }
    }

    static toString() {
        return 'PPOMPPU';
    }
}

module.exports = Ppomppu;
