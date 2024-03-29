const querystring = require('querystring');
const axios = require('axios');

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
    getRankUrl,
} = require('./constants');
const { getCacheData, setCacheData, hasCacheData } = require('../../helpers');

class Dcinside extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.boardTypes = boardTypes;
        this.canAddBoards = true;
        this.getSearchParams = search.getSearchParams;
        this.searchTypes = search.types;
        this.imageXhrRequired = true;
        this.filterOptions = filterOptions;
        this.noSaveBoardsIndex = [3, 4];
    }

    getBoards() {
        return new Promise(async resolve => {
            await this.changeUserAgent('mobile');
            super.getBoards(boards, ignoreBoards);
            const ranks = await this.getHotGalleryRank();
            this.boards = [...this.boards, ...ranks];
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

        return await this.page.evaluate(() => {
            const lists = document.querySelectorAll(
                '.gall-detail-lst li .gall-detail-lnktb',
            );

            return Array.from(lists)
                .map(list => {
                    const link = list
                        .querySelector('a.lt')
                        .getAttribute('href');
                    const title = list.querySelector('.subjectin');
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
                            hit: hit.innerText.trim().replace(/[^0-9]/g, ''),
                            time: time.innerText.trim(),
                            link,
                            upVotes:
                                parseInt(
                                    upVotes &&
                                        upVotes.innerText.replace(/[^0-9]/),
                                ) || 0,
                            numberOfComments: parseInt(
                                numberOfComments.innerText,
                            ),
                            hasImages: !!hasImages,
                        }
                    );
                })
                .filter(post => post);
        });
    }

    async getPostDetail({ link, id, category }, disableComments) {
        await this.page.goto(link);

        const postDetail = await this.page.evaluate(() => {
            const _title = document.querySelector('.gallview-tit-box .tit');
            const author = document.querySelector(
                '.btm .ginfo2 li:nth-child(1)',
            );
            const hit = document.querySelector(
                '.gall-thum-btm .ginfo2 li:nth-child(1)',
            );
            const body = document.querySelector('.thum-txt');
            const upVotes = document.querySelector('#recomm_btn');
            const downVotes = document.querySelector('#nonrecomm_btn');
            const time = document.querySelector('.btm .ginfo2 li:nth-child(2)')
                .innerText;
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
                time: time.slice(2),
                body: body.innerText.trim(),
                images,
                hasImages: images.length,
                upVotes: upVotes ? parseInt(upVotes.innerText) : 0,
                downVotes: downVotes ? parseInt(downVotes.innerText) : 0,
                comments: [],
            };
        });

        if (!disableComments) {
            postDetail.comments = await this.page.evaluate(
                this.processComments,
            );
        }

        return {
            ...postDetail,
            id,
            category,
        };
    }

    processComments() {
        const comments = document.querySelectorAll('.all-comment-lst li');

        return Array.from(comments)
            .map(comment => {
                const body = comment.querySelector('.txt');
                const author = comment.querySelector('.nick');
                const time = comment.querySelector('.date');
                const isReply = comment.classList.contains('comment-add');

                if (!body) {
                    return null;
                }

                body.querySelectorAll('img').forEach((image, index) => {
                    image.insertAdjacentText('afterend', `IMAGE_${index + 1} `);
                });

                const output = {
                    isReply: !!isReply,
                    isRemoved: false,
                    author: author.innerText,
                    time: time.innerText,
                    body: body.innerText.trim(),
                };

                output.id = output.author + output.time;

                return output;
            })
            .filter(comment => comment);
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

    canUpdateBoard(index) {
        return !this.noSaveBoardsIndex.find(i => i === index);
    }

    async getHotGalleryRank() {
        const cacheKey = 'dcinsideRanks';

        if (hasCacheData(cacheKey)) return getCacheData(cacheKey);

        const galleryRankReq = axios.get(getRankUrl(false));
        const mgalleryRankReq = axios.get(getRankUrl(true));

        const ranks = await Promise.all([galleryRankReq, mgalleryRankReq]).then(
            responses => {
                const [gRes, mgRes] = responses;
                const rankData = [...gRes.data, ...mgRes.data];

                const galleryRankLength = gRes.data.length;
                const output = rankData.map(({ ko_name, id, rank }, index) => {
                    const isMinorGallery = index >= galleryRankLength;

                    return {
                        name: ko_name,
                        value: id,
                        type: boardTypes[isMinorGallery ? 4 : 3],
                        subName: rank,
                        noSave: true,
                    };
                });
                return output;
            },
        );

        setCacheData(cacheKey, ranks, {
            save: true,
            ttl: 28800000 /* 8 hr. */,
        });

        return ranks;
    }
}

Dcinside.prototype.constructor.type = 'dcinside';

module.exports = Dcinside;
