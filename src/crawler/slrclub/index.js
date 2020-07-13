const CommunityCrawler = require('../CommunityCrawler');
const {
    baseUrl,
    commentsUrl,
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
        this.imageXhrRequired = true;
    }

    async getBoards() {
        return new Promise(async (resolve, reject) => {
            await this.changeUserAgent('mobile');
            super.getBoards(boards, ignoreBoards);
            resolve();
        });
    }

    async getPosts() {
        await this.page.goto(
            getUrl(this.currentBoard.value) + (this.currentPageNumber || ''),
        );

        const [posts, currentPageNumber] = await this.page.evaluate(baseUrl => {
            const lists = document.querySelectorAll('.list li:not(.notice)');
            const nextPageNumber = document
                .querySelector('.paging #actpg + a')
                .getAttribute('href')
                .split('/')
                .pop();

            return [
                Array.from(lists).map(list => {
                    const title = list.querySelector('.subject a');
                    const author = list.querySelector('.article-info span');
                    const infoEl = list
                        .querySelector('.article-info')
                        .innerText.split('|');
                    const time = infoEl[1];
                    const hit = infoEl[2].replace(/[^0-9]/g, '');
                    const upVotes = infoEl[3]
                        ? infoEl[3].replace(/[^0-9]/g, '')
                        : 0;
                    const hasImages = list.querySelector('.subject .li_ic');
                    const numberOfComments = list.querySelector('.cmt2');
                    const link = baseUrl + title.getAttribute('href');

                    return {
                        id: link.replace(/\?.*$/, '').split('/').pop(),
                        category: null,
                        title: title.innerText.trim(),
                        author: author.innerText.trim(),
                        hit: hit,
                        time: time,
                        link,
                        upVotes: parseInt(upVotes),
                        numberOfComments: numberOfComments.innerText,
                        hasImages: !!hasImages,
                    };
                }),
                parseInt(nextPageNumber) + 1,
            ];
        }, baseUrl);

        this.currentPageNumber = currentPageNumber;

        return posts;
    }

    async getPostDetail({ link, id, category }) {
        await this.page.goto(link);

        const postDetail = await this.page.evaluate(() => {
            const title = document.querySelector('.subject');
            const body = document.querySelector('#userct');
            const author = document.querySelector('.info-wrap span');
            const infoEl = document
                .querySelector('.info-wrap')
                .innerText.split('|');
            const time = infoEl[1].replace(/[^0-9:]/g, '');
            const hit = infoEl[2].replace(/[^0-9]/g, '');
            const upVotes = infoEl[3].replace(/[^0-9]/g, '');
            const numberOfComments = document.querySelector('#cmcnt');
            const commentsFormData = document.querySelector('#comment_box')
                .dataset;
            const imagesEl = body.querySelectorAll('img');
            const images = Array.from(imagesEl).map((image, index) => {
                const value = image.getAttribute('src');
                const isGif = value.slice(-3) === 'gif';

                image.textContent = `${isGif ? 'GIF' : 'IMAGE'}_${index + 1} `;

                return {
                    type: isGif ? 'gif' : 'image',
                    value,
                    name: image.textContent,
                };
            });

            // handle images
            imagesEl.forEach((image, index) => {
                const src = image.getAttribute('src');
                const isGif = src.slice(-3) === 'gif';

                image.textContent = `${isGif ? 'GIF' : 'IMAGE'}_${index + 1} `;
            });

            return {
                link: window.location.href,
                category: null,
                title: title.innerText.trim(),
                body: body.textContent
                    .split('\n')
                    .map(b => b.trim())
                    .join('\n')
                    .trim(),
                author: author.innerText.trim(),
                hit,
                time,
                images,
                hasImages: images.length,
                upVotes: parseInt(upVotes),
                comments: [],
                numberOfComments: parseInt(numberOfComments.innerText),
                commentsFormData: { ...commentsFormData },
            };
        });

        if (postDetail.numberOfComments && postDetail.commentsFormData) {
            postDetail.comments = await this.getComments(
                postDetail.commentsFormData,
            );
        }

        return { ...postDetail, id, category };
    }

    async getComments(formData) {
        try {
            return await this.page.evaluate(
                ({ bbsid, tos, cmrno, splno }, commentsUrl) => {
                    const form = new FormData();

                    form.append('id', bbsid);
                    form.append('tos', tos);
                    form.append('no', cmrno);
                    form.append('sno', '1');
                    form.append('spl', splno);

                    return fetch(commentsUrl, {
                        method: 'post',
                        body: form,
                    })
                        .then(data => data.json())
                        .then(({ c }) =>
                            c.map(({ del, th, name, memo, dt, vt }) => ({
                                id: name + dt,
                                isRemoved: !!del,
                                isReply: !!th,
                                author: name,
                                body: memo
                                    .trim()
                                    .replace(/<br \/>/g, '\n')
                                    .replace(/<[^>]*>/g, 'IMAGE_1'),
                                time: dt,
                                upVotes: vt,
                            })),
                        );
                },
                formData,
                commentsUrl,
            );
        } catch (e) {
            return [];
        }
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
