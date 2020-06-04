const querystring = require('querystring');

const { configstore } = require('../../helpers');
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

class Dcinside extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.title = Dcinside.toString();
        this.boardTypes = boardTypes;
        this.canRefreshBoards = false;
        this.canAddBoards = true;
    }

    getBoards() {
        return new Promise(async (resolve) => {
            let _boards = boards;

            if (configstore.has(this.title)) {
                _boards = configstore.get(this.title);
            } else {
                configstore.set(this.title, boards);
            }

            super.getBoards(_boards, ignoreBoards);
            await this.changeUserAgent('mobile');
            resolve();
        });
    }

    async getSortUrls() {
        this.sortUrls = await this.page.evaluate(() => {
            const sortsEl = document.querySelectorAll('.mal-lst li a');

            return Array.from(sortsEl).map((sort) => {
                const value = '&headid=' + sort.getAttribute('href').replace(/[^0-9]/g, '');
                const name = sort.innerText;

                return { value, name };
            });
        });
    }

    async getPosts() {
        await this.page.goto(
            getUrl(this.currentBoard.value) + this.pageNumber + this.sortUrl.value
        );

        await this.getSortUrls();

        const posts = await this.page.evaluate(() => {
            const lists = document.querySelectorAll('.gall-detail-lst li .gall-detail-lnktb');

            return Array.from(lists)
                .map((list) => {
                    const link = list.querySelector('a.lt').getAttribute('href');
                    const title = list.querySelector('.detail-txt');
                    const infoEl = list.querySelectorAll('.ginfo li');

                    let infoIndex = -1;

                    // has category
                    if (infoEl.length === 5) {
                        infoIndex += 1;
                    }

                    const category = infoEl[infoIndex++];
                    const author = infoEl[infoIndex++];
                    const time = infoEl[infoIndex++];
                    const hit = infoEl[infoIndex++];
                    const upVotes = infoEl[infoIndex++];
                    const numberOfComments = list.querySelector('.ct');
                    const hasImages = list.querySelector('.sp-lst-img');

                    return (
                        title &&
                        title.innerText && {
                            category: category && category.innerText,
                            title: title.innerText.trim(),
                            author: author.innerText.trim(),
                            hit: hit.innerText.trim().replace(/[^0-9]/),
                            time: time.innerText.trim(),
                            link,
                            upVotes: parseInt(upVotes && upVotes.innerText.replace(/[^0-9]/)) || 0,
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
            const _title = document.querySelector('.gallview-tit-box .tit');
            const author = document.querySelector('.btm .ginfo2 li:nth-child(1)');
            const hit = document.querySelector('.gall-thum-btm .ginfo2 li:nth-child(1)');
            const body = document.querySelector('.thum-txt');
            const upVotes = document.querySelector('.gall-thum-btm .ginfo2 li:nth-child(2)');
            const comments = document.querySelectorAll('.all-comment-lst li');
            const _time = document
                .querySelector('.btm .ginfo2 li:nth-child(2)')
                .innerText.match(/[0-9]{2}:[0-9]{2}/)[0];

            if (body) {
                const scripts = Array.from(body.querySelectorAll('script'));
                scripts.map((script) => script.parentNode.removeChild(script));
            }

            // handle gifs
            body.querySelectorAll('video source[type^=video]').forEach((gif, index) => {
                const text = document.createElement('span');
                text.innerText = `GIF_${index + 1} `;
                gif.parentNode.insertAdjacentElement('afterend', text);
            });

            // handle images
            body.querySelectorAll('img.lazy').forEach((image, index) => {
                const text = document.createElement('span');
                text.innerText = `IMAGE_${index + 1} `;
                image.insertAdjacentElement('afterend', text);
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
                comments: Array.from(comments)
                    .map((comment) => {
                        const body = comment.querySelector('.txt');
                        const author = comment.querySelector('.nick');
                        const time = comment.querySelector('.date');
                        const isReply = comment.classList.contains('comment-add');

                        if (!body) {
                            return null;
                        }

                        body.querySelectorAll('img').forEach((image, index) => {
                            image.textContent = `IMAGE_${index + 1} `;
                        });

                        return {
                            isReply: !!isReply,
                            isRemoved: false,
                            author: author.innerText,
                            time: time.innerText.match(/[0-9]{2}:[0-9]{2}/)[0],
                            body: body.textContent.trim(),
                        };
                    })
                    .filter((comment) => comment),
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
        return 'dcinside';
    }
}

module.exports = Dcinside;
