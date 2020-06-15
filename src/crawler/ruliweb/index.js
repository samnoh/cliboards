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

class Ruliweb extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.title = Ruliweb.toString();
        this.boardTypes = boardTypes;
    }

    async getBoards() {
        return new Promise(async (resolve, reject) => {
            await this.changeUserAgent();
            super.getBoards(boards, ignoreBoards);
            resolve();
        });
    }

    async getPosts() {
        await this.page.goto(getUrl(this.currentBoard.value) + this.pageNumber);

        const posts = await this.page.evaluate(() => {
            const lists = document.querySelectorAll('.table_body:not(.inside)');

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

        return posts.map(post => ({
            ...post,
            hasRead: this.postsRead.has(post.link),
        }));
    }

    async getPostDetail(link) {
        await this.page.goto(link);

        this.postsRead.add(this.currentBaseUrl); // set post that you read

        return await this.page.evaluate(() => {
            const title = document.querySelector('.subject_text');
            const author = document.querySelector('.nick');
            const hit = document
                .querySelector('.user_info p:nth-child(5)')
                .innerText.split(' ');
            const body = document.querySelector('.view_content');
            const upVotes = document.querySelector('.like');
            const comments = document.querySelectorAll(
                '.comment_view.normal tr',
            );
            const time = document.querySelector('.regdate');
            const images = Array.from(
                document.querySelectorAll('.img_load img, .gifct'),
            ).map((item, index) => {
                let value, type;

                if (item.classList.contains('gifct')) {
                    type = 'mp4';
                    value = item.querySelector('video').getAttribute('src');
                    item.innerHTML = `GIF_${index + 1}`;
                } else {
                    type = 'image';
                    value = item.getAttribute('src');
                    item.textContent = `IMAGE_${index + 1}`;
                }

                return {
                    type,
                    value: 'https:' + value,
                    name: item.textContent,
                };
            });

            return {
                category: title.innerText.trim().match(/\[([^)]+)\]\s/)[1],
                title: title.innerText.trim().replace(/\[([^)]+)\]\s/, ''),
                author: author.innerText.trim(),
                hit: hit[hit.length - 1],
                time: time.innerText
                    .trim()
                    .split(' ')[1]
                    .replace(/[^0-9:]/g, ''),
                body: body.textContent
                    .split('\n')
                    .map(b => b.trim())
                    .join('\n')
                    .trim(),
                upVotes: parseInt(upVotes.innerText),
                images,
                hasImages: images.length,
                comments: Array.from(comments).map(comment => {
                    const body = comment.querySelector('.text_wrapper');
                    const author = comment.querySelector('.nick');
                    const time = comment.querySelector('.time');
                    const upVotes = comment.querySelector('.btn_like .num');
                    const downVotes = comment.querySelector(
                        '.btn_dislike .num',
                    );
                    const isReply = comment.classList.contains('child');
                    const control_box = comment.querySelector('.control_box');
                    const isRemoved = !comment.getAttribute('id');

                    if (isReply && control_box) {
                        body.removeChild(control_box);
                    }

                    return isRemoved
                        ? {
                              isReply,
                              isRemoved,
                              body: body.innerText.trim(),
                          }
                        : {
                              isReply,
                              isRemoved,
                              author: author.innerText,
                              time: time.innerText.split(' ')[1],
                              body: body.innerText.trim(),
                              upVotes: parseInt(upVotes.innerText) || 0,
                              downVotes: parseInt(downVotes.innerText) || 0,
                          };
                }),
            };
        });
    }

    static toString() {
        return 'Ruliweb';
    }
}

module.exports = Ruliweb;
