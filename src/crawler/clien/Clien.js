const Crawler = require('../Crawler');
const { baseUrl, getUrl, sortUrls, ignoreBoards } = require('./constants');
const { configstore } = require('../../helpers');

class Clien extends Crawler {
    constructor() {
        super();

        this.title = 'CLIEN';
        this.boards = [];
        this.postsRead = new Set();
        this.currentBoardIndex = 0;
        this.currentPageNumber = 0;
        this.sortListIndex = 0;
    }

    async getBoards() {
        try {
            if (configstore.has('clien/boards')) {
                this.boards = configstore.get('clien/boards');
                return;
            }

            await this.page.goto(baseUrl);

            this.boards = await this.page.evaluate((ignoreBoards) => {
                const main = Array.from(document.querySelectorAll('.navmenu a'));
                const sub = Array.from(document.querySelectorAll('.menu_somoim a'));

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
                                  isSub: mainBoardSize < index,
                              }
                            : null;
                    })
                    .filter((board) => board);
            }, ignoreBoards);

            configstore.set('clien/boards', this.boards);
        } catch (e) {
            this.deleteBoards();
            throw new Error(e);
        }
    }

    async getPosts() {
        await this.page.goto(
            getUrl(this.boards[this.currentBoardIndex].value) +
                this.currentPageNumber +
                sortUrls[this.sortListIndex].value
        );

        const posts = await this.page.evaluate((baseUrl) => {
            const lists = document.querySelectorAll('.list_content .list_item');

            return Array.from(lists)
                .map((list) => {
                    const category = list.querySelector('.list_subject .category');
                    const title = list.querySelector('.list_subject .subject_fixed');
                    const link = list.querySelector('.list_subject');
                    const author = list.querySelector('.list_author .nickname');
                    const hit = list.querySelector('.list_hit');
                    const time = list.querySelector('.list_time');
                    const upVotes = list.querySelector('.list_symph');
                    const numberOfComments = list.querySelector('.rSymph05');
                    const hasImages = list.querySelector('.fa-picture-o');

                    return title && title.innerText
                        ? {
                              category: category && category.innerText,
                              title: title.innerText.trim(),
                              author:
                                  author.innerText.trim() ||
                                  author.querySelector('img').getAttribute('alt'),
                              hit: hit.innerText.trim(),
                              time: time.innerText.trim(),
                              link: baseUrl + link.getAttribute('href'),
                              upVotes: parseInt(upVotes.innerText),
                              numberOfComments: numberOfComments
                                  ? parseInt(numberOfComments.innerText)
                                  : 0,
                              hasImages: !!hasImages,
                          }
                        : null;
                })
                .filter((posts) => posts);
        }, baseUrl);

        return posts.map((post) => ({ ...post, hasRead: this.postsRead.has(post.link) }));
    }

    async getPostDetail(link) {
        await this.page.goto(link);

        const postDetail = await this.page.evaluate(() => {
            const category = document.querySelector('.post_subject .post_category');
            const title = document.querySelector('.post_subject span:not(.post_category)');
            const author = document.querySelector('.post_info .contact_name');
            const hit = document.querySelector('.view_info');
            const body = document.querySelector('.post_article');
            const upVotes = document.querySelector('.symph_count strong');
            const comments = document.querySelectorAll('.comment_row');
            const time = document.querySelector('.post_author span');
            const images = Array.from(
                document.querySelectorAll('.post_content img') || []
            ).map((image) => image.getAttribute('src'));

            const gifs = Array.from(body.querySelectorAll('.fr-video') || []);

            // handle GIFs
            gifs.map((gif, index) => {
                const src = gif.querySelector('source').getAttribute('src');
                gif.innerHTML = `GIF_${index} `;
                images.push(src);
            });

            // handle images
            body.querySelectorAll('img').forEach((image, index) => {
                image.textContent = `IMAGE_${index} `;
            });

            return {
                category: category && category.innerText,
                title: title.innerText.trim(),
                author: author.innerText.trim() || author.querySelector('img').getAttribute('alt'),
                hit: hit.innerText.trim(),
                time: time.innerText.trim().split(' ')[1],
                body: body.textContent
                    .split('\n')
                    .map((b) => b.trim())
                    .join('\n')
                    .trim(),
                upVotes: parseInt(upVotes.innerText),
                images,
                hasImages: images.length,
                comments: Array.from(comments).map((comment) => {
                    const isRemoved = comment.classList.contains('blocked');
                    const isReply = comment.classList.contains('re');
                    const body = comment.querySelector('.comment_content');
                    const author = comment.querySelector('.contact_name');
                    const time = comment.querySelector('.comment_time .timestamp');
                    const upVotes = comment.querySelector('.comment_symph');

                    // handle animated author name
                    if (isReply && !isRemoved) {
                        const replyTo = body.querySelector('.comment_view strong img');

                        if (replyTo) {
                            const nickId = document.createTextNode(
                                replyTo.getAttribute('data-nick-id')
                            );

                            replyTo.parentNode.replaceChild(nickId, replyTo);
                        }
                    }

                    return isRemoved
                        ? {
                              isReply,
                              isRemoved,
                              body: '삭제 되었습니다.',
                          }
                        : {
                              isReply,
                              isRemoved,
                              author:
                                  author.innerText ||
                                  author.querySelector('img').getAttribute('alt'),
                              time: time.innerText.split(' ')[1],
                              body: body.innerText,
                              upVotes: parseInt(upVotes.innerText.trim()),
                          };
                }),
            };
        });

        this.postsRead.add(link); // set post that you read

        return postDetail;
    }

    async changeBoard(board) {
        this.currentBoardIndex = this.boards.findIndex((_board) => _board.value === board.value);
        return await this.getPosts();
    }

    changeSortList(index) {
        this.currentPageNumber = 0;
        this.sortListIndex = index;
    }

    deleteBoards() {
        configstore.delete('clien/boards');
    }
}

module.exports = Clien;
