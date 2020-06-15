const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const axios = require('axios');
const FormData = require('form-data');

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

        return posts.map(post => ({
            ...post,
            hasRead: this.postsRead.has(post.link),
        }));
    }

    async getPostDetail(link) {
        await this.page.goto(link);

        this.postsRead.add(this.currentBaseUrl); // set post that you read

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
            const images = Array.from(imagesEl).map(img =>
                img.getAttribute('src'),
            );

            // handle images
            imagesEl.forEach((image, index) => {
                const src = image.getAttribute('src');
                const isGif = src.slice(-3) === 'gif';

                image.textContent = `${isGif ? 'GIF' : 'IMAGE'}_${index + 1} `;
            });

            return {
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

        return postDetail;
    }

    async getComments(data) {
        const form = new FormData();

        form.append('id', data.bbsid);
        form.append('tos', data.tos);
        form.append('no', data.cmrno);
        form.append('sno', '1');
        form.append('spl', data.splno);

        try {
            const response = await axios({
                method: 'post',
                url: commentsUrl,
                data: form,
                headers: { Referer: this.currentBaseUrl, ...form.getHeaders() },
            });

            if (!response.data.c) {
                throw new Error();
            }

            return response.data.c.map(comment => ({
                isRemoved: !!comment.del,
                isReply: !!comment.th,
                author: comment.name,
                body: comment.memo
                    .trim()
                    .replace(/<br \/>/g, '\n')
                    .replace(/<[^>]*>/g, 'IMAGE_1'),
                time: comment.dt,
                upVotes: comment.vt,
            }));
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

    async openImages(urls) {
        const tempFolderPath = path.resolve(__dirname, '..', '..', 'temp');

        fs.rmdirSync(tempFolderPath, { recursive: true });

        mkdirp.sync(tempFolderPath);

        const requests = urls.map(url =>
            axios.get(url, {
                headers: {
                    host: 'media.slrclub.com',
                    Referer: this.currentBaseUrl,
                },
                responseType: 'stream',
            }),
        );

        try {
            return axios.all([...requests]).then(
                axios.spread((...resps) =>
                    Promise.all(
                        resps.map((res, index) => {
                            const ext = res.data.responseUrl.split('.').pop();

                            return new Promise(resolve => {
                                const file = fs.createWriteStream(
                                    path.resolve(
                                        tempFolderPath,
                                        index + '.' + ext,
                                    ),
                                );
                                file.on('finish', () =>
                                    file.close(() => resolve(file)),
                                );
                                res.data.pipe(file);
                            });
                        }),
                    ).then(files =>
                        files.map(file => file.path.split('/').pop()),
                    ),
                ),
            );
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    static toString() {
        return 'SLRClub';
    }
}

module.exports = SLRClub;
