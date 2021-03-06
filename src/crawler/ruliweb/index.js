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
    commentsUrl,
    search,
} = require('./constants');

class Ruliweb extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.boardTypes = boardTypes;
        this.getSearchParams = search.getSearchParams;
        this.searchTypes = search.types;
    }

    async getBoards() {
        return new Promise(async (resolve, reject) => {
            await this.changeUserAgent();
            super.getBoards(boards, ignoreBoards);
            resolve();
        });
    }

    async getPosts() {
        await this.page.goto(
            getUrl(this.currentBoard.value) +
                this.pageNumber +
                (this.searchParams.value || ''),
        );

        const posts = await this.page.evaluate(() => {
            const lists = document.querySelectorAll(
                '.table_body:not(.inside):not(.notice):not(.list_inner)',
            );

            return Array.from(lists)
                .map(list => {
                    const category = list.querySelector('.divsn');
                    const title = list.querySelector('.subject .deco');
                    const author = list.querySelector('.writer');
                    const hit = list.querySelector('.hit');
                    const time = list.querySelector('.time');
                    const upVotes = list.querySelector('.recomd');
                    const numberOfComments = list.querySelector(
                        '.subject .num_reply .num',
                    );
                    const hasImages = list.querySelector('.icon-picture');

                    return (
                        title &&
                        title.innerText && {
                            category: category && category.innerText,
                            title: title.innerText.trim(),
                            author: author.innerText.trim(),
                            hit: hit.innerText.trim(),
                            time: time.innerText.trim(),
                            link: title.getAttribute('href'),
                            upVotes: parseInt(upVotes.innerText) || 0,
                            numberOfComments: numberOfComments
                                ? parseInt(numberOfComments.innerText)
                                : 0,
                            hasImages: !!hasImages,
                        }
                    );
                })
                .filter(post => post);
        });

        return posts.map(p => ({
            ...p,
            id: p.link.replace(/\?.*$/, '').split('/').pop(),
        }));
    }

    async getPostDetail({ link, id, category }, disableComments) {
        await this.page.goto(link);

        const postDetail = await this.page.evaluate(() => {
            const title = document.querySelector('.subject_text');
            const author = document.querySelector('.nick');
            const hit = document
                .querySelector('.user_info p:nth-child(5)')
                .innerText.split(' ');
            const upVotes = document.querySelector('.like');
            const time = document.querySelector('.regdate');
            const commentPages = document.querySelectorAll(
                '.comment_count_wrapper .paging_wrapper a.btn_num',
            ).length;
            const body = document.querySelector('.view_content');
            const images = Array.from(
                body.querySelectorAll(
                    'img, .gifct, iframe[src^="https://www.youtube.com/embed"]',
                ),
            ).map((item, index) => {
                let value = item.getAttribute('src');
                let type, name;

                if (item.classList.contains('gifct')) {
                    const video = item.querySelector('video');

                    if (video) {
                        type = 'mp4';
                        value = video.getAttribute('src');
                    }
                    name = `GIF_${index + 1}`;
                } else if (item.tagName === 'IFRAME') {
                    type = 'youtube';
                    name = `YOUTUBE_${index + 1}`;
                } else {
                    type = 'image';
                    name = `IMAGE_${index + 1}`;
                }

                item.parentNode.innerText = name;

                return (
                    value && {
                        type,
                        value:
                            value.slice(0, 6) === 'https:'
                                ? value
                                : 'https:' + value,
                        name,
                    }
                );
            });

            // clean up body
            const screenOut = body.querySelector('.screen_out');
            if (screenOut) {
                body.querySelector('.screen_out').remove();
            }

            const source = document.querySelector('.source_url a');
            if (source) {
                body.innerText = `원본출처 | ${source.getAttribute(
                    'href',
                )}\n\n\n${body.innerText}`;
            }

            return {
                link: window.location.href,
                category: title.innerText.trim().match(/\[([^)]+)\]\s/)[1],
                title: title.innerText.trim().replace(/\[([^)]+)\]\s/, ''),
                author: author.innerText.trim(),
                hit: hit[hit.length - 1],
                time: time.innerText
                    .replace(/[^\.\d\s:]/g, '')
                    .slice(2)
                    .slice(0, -3),
                body: body.innerText
                    .trim()
                    .split('\n')
                    .map(a => a || '\n')
                    .join(''),
                upVotes: parseInt(upVotes.innerText),
                images,
                hasImages: images.length,
                comments: [],
                extraData: {
                    nCommentPages: commentPages,
                    isXHRRequired: commentPages !== 1,
                },
            };
        });

        if (!disableComments) {
            postDetail.comments = await this.page.evaluate(
                this.processComments,
            );

            const { isXHRRequired, nCommentPages } = postDetail.extraData;

            if (isXHRRequired) {
                const newComments = await this.getNextAllComments(
                    nCommentPages,
                );
                postDetail.comments = [...postDetail.comments, ...newComments];
            }
        }

        return { ...postDetail, id, category };
    }

    processComments() {
        const comments = document.querySelectorAll('.comment_view.normal tr');

        return Array.from(comments).map(comment => {
            const body = comment.querySelector('.text_wrapper');
            const author = comment.querySelector('.nick');
            const time = comment.querySelector('.time');
            const upVotes = comment.querySelector('.btn_like .num');
            const downVotes = comment.querySelector('.btn_dislike .num');
            const isReply = comment.classList.contains('child');
            const control_box = comment.querySelector('.control_box');
            const isRemoved = !comment.getAttribute('id');

            // handle image
            const image = comment.querySelector('.comment_img_text');
            if (image) image.innerText = 'IMAGE_1';

            isReply && control_box && body.removeChild(control_box);

            return isRemoved
                ? {
                      isReply,
                      isRemoved,
                      body: body.innerText.trim(),
                  }
                : {
                      isReply,
                      isRemoved,
                      id: author.innerText + time.innerText,
                      author: author.innerText,
                      time: time.innerText.trim(),
                      body: body.innerText.trim(),
                      upVotes: parseInt(upVotes.innerText) || 0,
                      downVotes: parseInt(downVotes.innerText) || 0,
                  };
        });
    }

    async getNextAllComments(nPages) {
        try {
            const baseLink = this.currentBaseUrl;
            const postInfo = baseLink.split('?')[0].split('/');
            const body = {
                board_id: postInfo[5],
                article_id: postInfo[7],
            };
            const config = {
                headers: {
                    Referer: baseUrl,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            };
            let requests = [];

            for (let i = 2; i <= nPages; i++) {
                requests.push(
                    axios.post(
                        commentsUrl,
                        querystring.stringify({ ...body, page: i }),
                        config,
                    ),
                );
            }

            let commentViews = '';

            await Promise.all(requests).then(responses =>
                responses.map(res => {
                    commentViews += res.data.view;
                }),
            );

            await this.page.setContent(commentViews);
            return await this.page.evaluate(this.processComments);
        } catch (e) {
            return [];
        }
    }
}

module.exports = Ruliweb;
