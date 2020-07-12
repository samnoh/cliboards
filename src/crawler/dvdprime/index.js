const CommunityCrawler = require('../CommunityCrawler');
const {
    baseUrl,
    getUrl,
    sortUrls,
    boardTypes,
    ignoreRequests,
    boards,
    ignoreBoards,
    search,
} = require('./constants');

class DVDPrime extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.title = DVDPrime.toString();
        this.boardTypes = boardTypes;
        this.getSearchParams = search.getSearchParams;
        this.searchTypes = search.types;
    }

    async getBoards() {
        try {
            await this.changeUserAgent();
            await this.page.goto(baseUrl); // to get author names

            super.getBoards(boards, ignoreBoards);
        } catch (e) {
            throw new Error(e);
        }
    }

    async getPosts() {
        await this.page.goto(
            getUrl(this.currentBoard.value) +
                this.pageNumber +
                this.searchParams.value,
        );

        const posts = await this.page.evaluate(baseUrl => {
            const lists = document.querySelectorAll('.list_table_row');

            return Array.from(lists)
                .map(list => {
                    const category = list.querySelector('.list_category_text');
                    const title = list.querySelector('.list_subject_span_pc');
                    const author = list.querySelector('.list_table_col_name');
                    const hit = list.querySelector('.list_table_col_hit');
                    const time = list.querySelector('.list_table_dates');
                    const link = list
                        .querySelector('.list_subject_a')
                        .getAttribute('href');
                    const upVotes = list.querySelector(
                        '.list_table_col_recommend',
                    );
                    const numberOfComments = list.querySelector(
                        '.list_comment_new',
                    );

                    return (
                        title &&
                        title.innerText && {
                            id: link.match(/wr_id=(\d*)/)[1],
                            category: category.innerText,
                            title: title.innerText.trim(),
                            author: author.innerText.trim(),
                            hit: hit.innerText.trim() || 0,
                            time: time.innerText.trim(),
                            link: baseUrl + link,
                            upVotes: parseInt(upVotes.innerText) || 0,
                            numberOfComments: numberOfComments
                                ? parseInt(numberOfComments.innerText)
                                : 0,
                            hasImages: false,
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

    async getPostDetail({ link, id, category }) {
        await this.page.goto(link);

        this.postsRead.add(this.title + id); // set post that you read

        const postDetail = await this.page.evaluate(() => {
            const title = document.querySelector('#writeSubject');
            const author = document.querySelector('#view_nickname');
            const hit = document.querySelector('#view_hit');
            const body = document.querySelector('.resContents');
            const upVotes = document.querySelector('#view_recommend_num');
            const comments = document.querySelectorAll('.comment_container');
            const time = document
                .querySelector('#view_datetime')
                .innerText.match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)[0];
            const images = Array.from(
                body.querySelectorAll(
                    'img, video, iframe[src^="https://www.youtube.com/embed"]',
                ),
            ).map((item, index) => {
                let type, value, name;

                if (item.tagName === 'VIDEO') {
                    type = 'mp4';
                    value = item.querySelector('source').src;
                    name = `GIF_${index + 1}`;
                } else if (item.tagName === 'IFRAME') {
                    type = 'youtube';
                    value = item.src;
                    name = `YOUTUBE_${index + 1}`;
                } else {
                    type = 'image';
                    value = item.src;
                    name = `IMAGE_${index + 1} `;
                }

                item.parentNode.innerText = name;

                return { type, value, name };
            });

            const seriesDiv = document.querySelector('.view_series_div');
            seriesDiv && body.removeChild(seriesDiv);

            body.querySelectorAll('.article_link').forEach(link => {
                link.innerHTML = link.href;
            });

            return {
                link: window.location.href,
                title: title.innerText,
                author: author.innerText.trim(),
                hit: hit.innerText.trim(),
                time,
                body: body.innerText.split('\n\n').join('\n').trim(),
                upVotes: parseInt(upVotes.innerText),
                images,
                hasImages: images.length,
                comments: Array.from(comments).map(comment => {
                    const body = comment.querySelector('.comment_content');
                    const author = comment.querySelector('.sideview_a');
                    const time = comment
                        .querySelector('.comment_time')
                        .innerText.match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)[0];
                    const upVotes = comment.querySelector(
                        '.comment_title_right .c_r_num',
                    );
                    const replyEl = comment.querySelector(
                        '.comment_content_container_reply',
                    );
                    const isReply = replyEl
                        ? parseInt(replyEl.className.replace(/[^0-9]/g, ''))
                        : 0;

                    const spoilerWarning = body.querySelectorAll(
                        '.view_warning_div, .view_warning_stoptalking',
                    );

                    if (spoilerWarning.length) {
                        body.removeChild(spoilerWarning[0]);
                    }

                    body.querySelectorAll(
                        'img:not([src$=".gif"]), video',
                    ).forEach((item, index) => {
                        if (item.tagName === 'VIDEO') {
                            item.parentNode.innerText = `GIF_${index + 1}`;
                        } else {
                            item.parentNode.innerText = `IMAGE_${index + 1}`;
                        }
                    });

                    const output = {
                        isReply,
                        isRemoved: false,
                        author: author.innerText,
                        time,
                        body: body.innerText.trim(),
                        upVotes: parseInt(upVotes.innerText),
                    };

                    output.id = output.author + output.time;

                    return output;
                }),
            };
        });

        return { ...postDetail, id, category };
    }

    static toString() {
        return 'DVDPrime';
    }
}

module.exports = DVDPrime;
