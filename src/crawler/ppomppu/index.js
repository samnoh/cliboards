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
} = require('./constants');
const { getYoutubeVideoId } = require('../../helpers');

class Ppomppu extends CommunityCrawler {
    constructor() {
        super(sortUrls, ignoreRequests, baseUrl);

        this.title = Ppomppu.toString();
        this.boardTypes = boardTypes;
        this.getSearchParams = search.getSearchParams;
        this.searchTypes = search.types;
    }

    getBoards() {
        return new Promise(async resolve => {
            await this.changeUserAgent('mobile');
            super.getBoards(boards, ignoreBoards);
            resolve();
        });
    }

    async getPosts() {
        await this.page.goto(
            getUrl(
                this.currentBoard.value,
                this.pageNumber,
                this.sortUrl.value,
                this.searchParams.value,
            ),
        );

        return await this.page.evaluate(
            (baseUrl, currentBoard) => {
                const lists = document.querySelectorAll('.bbsList li a');

                if (lists.length) {
                    return Array.from(lists)
                        .map(list => {
                            const author =
                                list.querySelector('.ct') ||
                                list.querySelector('.name');
                            const numberOfComments = list.querySelector('.rp');

                            const title =
                                list.querySelector('strong') ||
                                list.querySelector('.title');

                            try {
                                numberOfComments &&
                                    title.removeChild(numberOfComments);
                            } catch (e) {}

                            let time = list.querySelector('.b');
                            let category, hit, upVotes, downVotes;

                            if (time) {
                                const infoEl = list
                                    .querySelector('.hi')
                                    .innerText.split('/')
                                    .map(el => el.replace(/[^0-9]/g, ''));
                                hit = infoEl[0];
                                upVotes = infoEl[1];
                                downVotes = infoEl[2];
                            } else {
                                const timeEl = list.querySelector('.time');

                                const infoEl = timeEl.innerText
                                    .replace(/[^0-9:\-]/g, '/')
                                    .split('/')
                                    .filter(a => a);

                                timeEl.removeChild(
                                    timeEl.querySelector('time'),
                                );
                                category = timeEl.innerText
                                    .replace('|', '')
                                    .trim();
                                time = infoEl[0];
                                hit = infoEl[1];
                                upVotes = infoEl[2];
                                downVotes = infoEl[3];
                            }

                            let link = list.getAttribute('href');

                            if (link && !link.includes('/new/')) {
                                link =
                                    `/new/${
                                        currentBoard === 'ppomppu2'
                                            ? 'bbs_view.php'
                                            : ''
                                    }` + link;
                            }

                            return (
                                author &&
                                author.innerText.trim() && {
                                    id: link.match(/&no=(\d*)/)[1],
                                    category,
                                    title: title.innerText.trim(),
                                    link: baseUrl + link,
                                    author: author.innerText.trim(),
                                    hit,
                                    time: time,
                                    upVotes: parseInt(upVotes),
                                    downVotes: parseInt(downVotes),
                                    numberOfComments: numberOfComments
                                        ? parseInt(numberOfComments.innerText)
                                        : 0,
                                }
                            );
                        })
                        .filter(post => post);
                } else {
                    const bbs = document.querySelector('.bbsList_new');
                    const lists2 = bbs.querySelectorAll('li a');

                    return Array.from(lists2).map(list => {
                        const category = list.querySelector('.exp span.ty');
                        const title = list.querySelector('.title .cont');
                        const author = list.querySelector('.names');
                        const time = list.querySelector('time');
                        const numberOfComments = list.querySelector(
                            '.title .rp',
                        );

                        const infoEl = list
                            .querySelector('.exp span:last-child')
                            .innerText.split('/')
                            .map(el => el.replace(/[^0-9]/g, ''));

                        const hit = infoEl[0];
                        const upVotes = infoEl[1];
                        const downVotes = infoEl[2];

                        let link = list.getAttribute('href');

                        if (!link.startsWith('/new/')) {
                            link = '/new/' + link;
                        }

                        return {
                            category: category.innerText,
                            title: title.innerText.trim(),
                            link: baseUrl + link,
                            time: time.innerText,
                            author: author.innerText,
                            hit,
                            upVotes: parseInt(upVotes),
                            downVotes: parseInt(downVotes),
                            numberOfComments: numberOfComments
                                ? parseInt(numberOfComments.innerText)
                                : 0,
                        };
                    });
                }
            },
            baseUrl,
            this.currentBoard.value,
        );
    }

    async getPostDetail({ link, id, category }) {
        await this.page.goto(link);

        const postDetail = await this.page.evaluate(() => {
            const h4 = document.querySelector('h4');
            const listComment = h4.querySelector('.list_comment');

            listComment && h4.removeChild(listComment.parentNode);

            const infoEl = document.querySelector('h4').innerText.split('\n');
            const _title = infoEl[0];
            const author = infoEl[1].split(' ')[0];

            const hi = document.querySelector('.hi').innerText;

            let category;

            if (hi.split('|').length === 2) {
                category = hi.split('|')[0].trim();
            }

            const time = hi.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/)[0];

            let otherInfoEl = infoEl[1].trim().split(' ');
            let hit = otherInfoEl[otherInfoEl.indexOf('조회') + 2];

            if (!hit) {
                otherInfoEl = infoEl[2].trim().split(' ');
                hit = otherInfoEl[otherInfoEl.indexOf('조회') + 2];
            }

            let upVotes = otherInfoEl[otherInfoEl.indexOf('추천') + 2];

            const body = document.querySelector('#KH_Content');
            const comments = document.querySelectorAll('.cmAr .sect-cmt');
            const imagesEl = Array.from(
                body.querySelectorAll(
                    'img, video, iframe[src^="https://www.youtube.com/embed"], a[href^="https://www.youtube.com/watch?v="]',
                ),
            ).filter(item => item.getAttribute('alt') !== '다운로드 버튼');
            const images = imagesEl.map((item, index) => {
                const text = document.createElement('span');

                let value, type, name;

                if (item.tagName === 'VIDEO') {
                    const videoDiv = item.parentNode.parentNode;
                    type = 'mp4';
                    value = item.querySelector('source').src;
                    name = `GIF_${index + 1}`;
                    text.innerText = name;
                    videoDiv.insertAdjacentElement('afterend', text);
                    videoDiv.removeChild(item.parentNode);
                } else if (item.tagName === 'IFRAME' || item.tagName === 'A') {
                    name = `YOUTUBE_${index + 1}`;
                    type = 'youtube';
                    item.parentNode.innerText = name;

                    if (item.tagName === 'IFRAME') {
                        value = item.src;
                    } else {
                        const id = item.href.match(
                            /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
                        )[5];
                        value = `https://youtube.com/embed/${id}`;
                    }
                } else {
                    name = `IMAGE_${index + 1}`;
                    type = 'image';
                    value = item.src;
                    text.innerText = name;
                    item.insertAdjacentElement('afterend', text);
                }

                return {
                    type,
                    value:
                        value.slice(0, 4) === 'http' ? value : 'http:' + value,
                    name,
                };
            });

            body.querySelectorAll('a.noeffect').forEach(link => {
                const href = link.getAttribute('href');
                link.innerText = link.innerText.replace(link.innerText, href);
            });

            const link = h4.querySelector('a.noeffect');

            if (link) {
                body.innerText =
                    '링크: ' +
                    link.getAttribute('href') +
                    '\n\n' +
                    body.innerText;
            }

            return {
                link: window.location.href,
                title: _title.trim(),
                category,
                author,
                hit: parseInt(hit),
                time,
                body: body.innerText.split('\n\n').join('\n').trim(),
                upVotes: parseInt(upVotes),
                images,
                hasImages: images.length,
                comments: Array.from(comments)
                    .map(comment => {
                        const body = comment.querySelector('.comment_memo td');
                        const author = comment.querySelector('.com_name span');
                        const time = comment.querySelector('.cin_02 span');
                        const isReply = parseInt(
                            comment.classList[0].replace('sect', ''),
                        );
                        const isHot = comment.parentNode.classList.contains(
                            'hot-comment-preview',
                        );

                        const votesEl = comment.querySelectorAll(
                            '.com_name > span',
                        );
                        let upVotes, downVotes;

                        if (votesEl.length === 3) {
                            upVotes = votesEl[2].innerText;
                            downVotes = votesEl[1].innerText;
                        }

                        body.querySelectorAll('img, video').forEach(
                            (item, index) => {
                                const text = document.createElement('span');
                                if (item.tagName === 'VIDEO') {
                                    const videoDiv = item.parentNode.parentNode;

                                    text.innerText = `GIF_${index + 1} `;
                                    videoDiv.insertAdjacentElement(
                                        'afterend',
                                        text,
                                    );
                                    videoDiv.removeChild(item.parentNode);
                                } else {
                                    text.innerText = `IMAGE_${index + 1} `;
                                    item.insertAdjacentElement(
                                        'afterend',
                                        text,
                                    );
                                }
                            },
                        );

                        body.querySelectorAll('a.noeffect').forEach(link => {
                            const href = link.getAttribute('href');
                            link.innerText = link.innerText.replace(
                                link.innerText,
                                href,
                            );
                        });

                        return (
                            !isHot && {
                                isReply,
                                isRemoved: false,
                                id: author.innerText + time.innerText,
                                author: author.innerText.trim(),
                                time: time.innerText.match(
                                    /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/,
                                )[0],

                                body: body.textContent.trim(),
                                upVotes: upVotes ? parseInt(upVotes.trim()) : 0,
                                downVotes: downVotes
                                    ? parseInt(downVotes.trim())
                                    : 0,
                            }
                        );
                    })
                    .filter(comment => comment),
            };
        });

        return { ...postDetail, id, category };
    }

    static toString() {
        return 'PPOMPPU';
    }
}

module.exports = Ppomppu;
