const querystring = require('querystring');

const CommunityCrawler = require('../CommunityCrawler');
const {
    baseUrl,
    getUrl,
    sortUrls,
    boardTypes,
    ignoreRequests,
    ignoreBoards,
    boards,
    search,
    filterOptions,
} = require('./constants');

class Dcinside extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.title = Dcinside.toString();
        this.boardTypes = boardTypes;
        this.canAddBoards = true;
        this.getSearchParams = search.getSearchParams;
        this.searchTypes = search.types;
        this.imageXhrRequired = true;
        this.filterOptions = filterOptions;
    }

    getBoards() {
        return new Promise(async resolve => {
            await this.changeUserAgent('mobile');
            super.getBoards(boards, ignoreBoards);
            resolve();
        });
    }

    async getPosts() {
        const _sortUrl = this.sortUrl ? this.sortUrl.value : '';
        const { value: boardValue } = this.currentBoard;
        const { value: filterValue } = this.currFilterOption;
        const { value: searchValue } = this.searchParams;

        await this.page.goto(
            getUrl(boardValue, filterValue) +
                this.pageNumber +
                _sortUrl +
                (searchValue || ''),
        );

        await this.getSortUrls(() => {
            const sortsEl = document.querySelectorAll('.mal-lst li a');

            return Array.from(sortsEl).map(sort => {
                const value =
                    '&headid=' +
                    (sort.getAttribute('href').replace(/[^0-9]/g, '') || '');
                const name = sort.innerText;

                return { value, name };
            });
        });

        const posts = await this.page.evaluate(() => {
            const lists = document.querySelectorAll(
                '.gall-detail-lst li .gall-detail-lnktb',
            );

            return Array.from(lists)
                .map(list => {
                    const link = list
                        .querySelector('a.lt')
                        .getAttribute('href');
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
                    const id = link.replace(/\?.*$/, '').split('/').pop();

                    return (
                        title &&
                        title.innerText && {
                            id,
                            category: category && category.innerText,
                            title: title.innerText.trim(),
                            author: author.innerText.trim(),
                            hit: hit.innerText.trim().replace(/[^0-9]/),
                            time: time.innerText.trim(),
                            link,
                            upVotes:
                                parseInt(
                                    upVotes &&
                                        upVotes.innerText.replace(/[^0-9]/),
                                ) || 0,
                            numberOfComments: numberOfComments.innerText,
                            hasImages,
                        }
                    );
                })
                .filter(post => post);
        });

        return posts.map(post => ({
            ...post,
            hasRead: this.postsRead.has(this.title + post.id),
        }));
    }

    async getPostDetail({ link, id, category }) {
        await this.page.goto(link);

        this.postsRead.add(this.title + id); // set post that you read

        const postDetail = await this.page.evaluate(() => {
            const _title = document.querySelector('.gallview-tit-box .tit');
            const author = document.querySelector(
                '.btm .ginfo2 li:nth-child(1)',
            );
            const hit = document.querySelector(
                '.gall-thum-btm .ginfo2 li:nth-child(1)',
            );
            const body = document.querySelector('.thum-txt');
            const upVotes = document.querySelector(
                '.gall-thum-btm .ginfo2 li:nth-child(2)',
            );
            const comments = document.querySelectorAll('.all-comment-lst li');
            const _time = document
                .querySelector('.btm .ginfo2 li:nth-child(2)')
                .innerText.match(/[0-9]{2}:[0-9]{2}/)[0];
            const imagesEl = Array.from(
                body.querySelectorAll(
                    'img.lazy, iframe[src^="https://www.youtube.com/embed"]',
                ),
            );
            const images = imagesEl.map((item, index) => {
                const text = document.createElement('span');
                let type, value;

                if (item.tagName === 'IFRAME') {
                    type = 'youtube';
                    text.innerText = `YOUTUBE_${index + 1}`;
                    value = item.src;
                } else {
                    const isGif =
                        item.classList.contains('gif-mp4') ||
                        item.dataset.original.split('.').pop() === 'gif';
                    type = isGif ? 'gif' : 'image';
                    value = item.dataset.original;
                    text.innerText = `${type.toUpperCase()}_${index + 1} `;
                }

                item.insertAdjacentElement('afterend', text);

                return {
                    type,
                    name: text.innerText,
                    value,
                };
            });

            if (body) {
                const scripts = Array.from(body.querySelectorAll('script'));
                scripts.map(script => script.parentNode.removeChild(script));
            }

            return {
                link: window.location.href,
                title: _title.innerText,
                author: author.innerText.trim(),
                hit: hit.innerText.replace(/[^0-9]/g, ''),
                time: _time,
                body: body.innerText.trim(),
                images,
                hasImages: images.length,
                upVotes: parseInt(upVotes.innerText.replace(/[^0-9]/g, '')),
                comments: Array.from(comments)
                    .map(comment => {
                        const body = comment.querySelector('.txt');
                        const author = comment.querySelector('.nick');
                        const time = comment.querySelector('.date');
                        const isReply = comment.classList.contains(
                            'comment-add',
                        );

                        if (!body) {
                            return null;
                        }

                        body.querySelectorAll('img').forEach((image, index) => {
                            image.textContent = `IMAGE_${index + 1} `;
                        });

                        const output = {
                            isReply: !!isReply,
                            isRemoved: false,
                            author: author.innerText,
                            time: time.innerText.match(/[0-9]{2}:[0-9]{2}/)[0],
                            body: body.textContent.trim(),
                        };

                        output.id = output.author + output.time;

                        return output;
                    })
                    .filter(comment => comment),
            };
        });

        return { ...postDetail, id, category };
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

            const getNameCallback = () =>
                document.querySelector('.gall-tit-lnk').innerText;

            await super.addBoard(getUrl(value), value, type, getNameCallback);
        } catch (e) {
            throw new Error(e);
        }
    }

    static toString() {
        return 'dcinside';
    }
}

module.exports = Dcinside;
