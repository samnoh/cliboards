const CommunityCrawler = require('../CommunityCrawler');
const {
    baseUrl,
    getUrl,
    sortUrls,
    boardTypes,
    ignoreBoards,
    ignoreRequests,
    boards,
} = require('./constants');
const { configstore } = require('../../helpers');

class Clien extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.title = Clien.toString();
        this.boardTypes = boardTypes;
    }

    async getBoards() {
        try {
            await this.changeUserAgent();

            if (configstore.has(this.title)) {
                this.boards = configstore.get(this.title);
                return;
            }
            await this.page.goto(baseUrl);

            const newBoards = await this.page.evaluate(
                (ignoreBoards, boardTypes) => {
                    const main = Array.from(
                        document.querySelectorAll('.navmenu a'),
                    );
                    const sub = Array.from(
                        document.querySelectorAll('.menu_somoim a'),
                    );
                    const mainBoardSize = main.length;
                    return [...main, ...sub]
                        .map((board, index) => {
                            const name = board.querySelectorAll('span')[1];
                            const link = board.getAttribute('href');
                            return link.includes('/service/board') &&
                                ignoreBoards.indexOf(name.innerText) === -1
                                ? {
                                      name: name.innerText,
                                      value: link,
                                      type:
                                          boardTypes[
                                              mainBoardSize < index ? 1 : 0
                                          ],
                                  }
                                : null;
                        })
                        .filter(board => board);
                },
                ignoreBoards,
                this.boardTypes,
            );

            this.boards = [...newBoards, ...boards];

            configstore.set(this.title, this.boards);
        } catch (e) {
            this.resetBoards();
            throw new Error(e);
        }
    }

    async getPosts() {
        await this.page.goto(
            getUrl(this.currentBoard.value) +
                this.currentPageNumber +
                this.sortUrl.value,
        );

        const posts = await this.page.evaluate(baseUrl => {
            const lists = document.querySelectorAll('.list_item');

            return Array.from(lists)
                .map(list => {
                    const category = list.querySelector(
                        '.list_subject .category',
                    );
                    const title = list.querySelector(
                        '.list_subject .subject_fixed',
                    );
                    const link = list.querySelector('.list_subject');
                    const author = list.querySelector('.list_author .nickname');
                    const hit = list.querySelector('.list_hit');
                    const time = list.querySelector('.list_time');
                    const upVotes = list.querySelector('.list_symph');
                    const numberOfComments = list.querySelector('.rSymph05');
                    const hasImages = list.querySelector('.fa-picture-o');

                    return (
                        title &&
                        title.innerText && {
                            id: link.getAttribute('href').split('/').pop(),
                            category: category && category.innerText,
                            title: title.innerText.trim(),
                            author:
                                author.innerText.trim() ||
                                author.querySelector('img').alt,
                            hit: hit.innerText.trim(),
                            time: time.innerText.trim(),
                            link: baseUrl + link.getAttribute('href'),
                            upVotes: parseInt(upVotes.innerText),
                            numberOfComments: numberOfComments
                                ? parseInt(numberOfComments.innerText)
                                : 0,
                            hasImages: !!hasImages,
                        }
                    );
                })
                .filter(post => post);
        }, baseUrl);

        return posts.map(post => ({
            ...post,
            hasRead: this.postsRead.has(this.title + post.id),
        }));
    }

    async getPostDetail({ link, id }) {
        await this.page.goto(link);

        this.postsRead.add(this.title + id); // set post that you read

        const postDetail = await this.page.evaluate(() => {
            const category = document.querySelector(
                '.post_subject .post_category',
            );
            const _title = document.querySelector(
                '.post_subject span:not(.post_category)',
            );
            const author = document.querySelector('.post_info .contact_name');
            const hit = document.querySelector('.view_info');
            const body = document.querySelector('.post_article');
            const upVotes = document.querySelector('.symph_count strong');
            const commentsEl = document.querySelectorAll('.comment_row');
            const time = document.querySelector('.post_author span');
            const images = Array.from(
                body.querySelectorAll(
                    'img, .fr-video, iframe[src^="https://www.youtube.com/embed"]',
                ),
            ).map((item, index) => {
                let value, type, name;

                if (item.classList.contains('fr-video')) {
                    type = 'mp4';
                    value = item.querySelector('source').getAttribute('src');
                    name = `GIF_${index + 1}`;
                } else if (item.tagName === 'IFRAME') {
                    type = 'youtube';
                    value = item.src;
                    name = `YOUTUBE_${index + 1}`;
                } else {
                    type = 'image';
                    value = item.getAttribute('src');
                    name = `IMAGE_${index + 1}`;
                }

                item.parentNode.innerText = name;

                return { type, value, name };
            });

            return {
                link: window.location.href,
                category: category && category.innerText,
                title: _title.innerText.trim(),
                author:
                    author.innerText.trim() ||
                    author.querySelector('img').getAttribute('alt'),
                hit: hit.innerText.trim(),
                time: time.innerText.trim().split(' ')[1],
                body: body.innerText
                    .split('\n\n')
                    .filter(a => a.trim())
                    .join('\n\n')
                    .trim(),
                upVotes: parseInt(upVotes.innerText),
                images,
                hasImages: images.length,
                extraData: {
                    isXHRRequired: commentsEl && commentsEl.length === 200,
                },
            };
        });

        postDetail.comments = postDetail.extraData.isXHRRequired
            ? await this.getAllComments()
            : await this.page.evaluate(this.processComments);

        return { ...postDetail, id };
    }

    processComments() {
        const commentsEl = document.querySelectorAll('.comment_row');

        return Array.from(commentsEl).map(comment => {
            const isRemoved = comment.classList.contains('blocked');
            const isReply = comment.classList.contains('re');

            if (isRemoved) {
                return {
                    isReply,
                    isRemoved,
                    body: '삭제 되었습니다.',
                };
            }

            const body = comment.querySelector('.comment_content');
            const author = comment.querySelector('.contact_name');
            const time = comment.querySelector('.comment_time .timestamp');
            const upVotes = comment.querySelector('.comment_symph');
            const image = comment.querySelector('.comment-img');
            const gif = comment.querySelector('.comment-video');

            // handle animated author name
            if (isReply && !isRemoved) {
                const replyTo = body.querySelector('.comment_view strong img');

                if (replyTo) {
                    const nickId = document.createTextNode(
                        replyTo.getAttribute('data-nick-id'),
                    );

                    replyTo.parentNode.replaceChild(nickId, replyTo);
                }
            }

            const output = {
                isReply,
                isRemoved,
                author:
                    author.innerText ||
                    author.querySelector('img').getAttribute('alt'),
                time: time.innerText.split(' ')[1],
                body:
                    image || gif
                        ? `${image ? 'IMAGE' : 'GIF'}_1\n\n` + body.innerText
                        : body.innerText,
                upVotes: parseInt(upVotes.innerText.trim()),
            };

            output.id = output.author + output.time;

            return output;
        });
    }

    async getAllComments() {
        try {
            const baseLink = this.currentBaseUrl;

            const data = await this.page.evaluate(baseLink => {
                return fetch(`${baseLink}/comment?order=date&po=0&ps=999999`, {
                    headers: {
                        Host: 'www.clien.net',
                    },
                }).then(data => data.text());
            }, baseLink);

            await this.page.setContent(data);

            const comments = await this.page.evaluate(this.processComments);

            return comments;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    static toString() {
        return 'Clien';
    }
}

module.exports = Clien;
