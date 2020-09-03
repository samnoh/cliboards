const Ppomppu = require('../../src/crawler/ppomppu');
const {
    baseUrl,
    boardTypes,
    boards,
    sortUrls,
    search: { getSearchParams, types: searchTypes },
} = require('../../src/crawler/ppomppu/constants');
const { checkResponseStatus } = require('../helpers/page');

let ppomppu;

beforeAll(async () => {
    ppomppu = new Ppomppu();
    ppomppu.resetBoards();
    await ppomppu.start();
});

afterAll(async () => {
    await ppomppu.close();
});

describe.skip('Ppomppu', () => {
    describe('properties', () => {
        test('baseUrl', () => {
            expect(ppomppu.baseUrl).toEqual(baseUrl);
        });

        test('title', () => {
            expect(ppomppu.title).toEqual('PPOMPPU');
        });

        test('boardTypes', () => {
            expect(ppomppu.boardTypes).toEqual(boardTypes);
        });

        test('searchTypes', () => {
            expect(ppomppu.searchTypes).toEqual(searchTypes);
        });

        test('sortUrls', () => {
            expect(ppomppu.sortUrls).toEqual(sortUrls);
        });
    });

    describe('methods', () => {
        let posts;

        test('getBoards()', async () => {
            await ppomppu.getBoards();

            expect(ppomppu.boards).toEqual(boards);
        });

        test('getPosts()', async () => {
            posts = await ppomppu.changeBoard(ppomppu.boards[0]);
            expect(posts.length).not.toBe(0);

            const firstPost = posts[0];
            // expect(firstPost.category).toBeDefined();
            expect(firstPost.title).toBeDefined();
            expect(firstPost.link).toBeDefined();
            expect(firstPost.time).toBeDefined();
            expect(firstPost.author).toBeDefined();
            expect(firstPost.hit).toBeDefined();
            expect(firstPost.upVotes).toBeDefined();
            expect(firstPost.downVotes).toBeDefined();
            expect(firstPost.numberOfComments).toBeDefined();
        });

        test('getPostDetail()', async () => {
            const postWithComments = posts.find(p => p.numberOfComments);

            if (postWithComments) {
                const post = await ppomppu.getPostDetail(postWithComments);
                expect(post.author).toBeDefined();
                expect(post.title).toBeDefined();
                expect(post.body).toBeDefined();
                expect(post.hit).toBeDefined();
                expect(post.time).toBeDefined();

                const comment = post.comments.find(c => !c.isRemoved);
                if (comment) {
                    expect(comment.isReply).toBeDefined();
                    expect(comment.isRemoved).toBeDefined();
                    expect(comment.id).toBeDefined();
                    expect(comment.author).toBeDefined();
                    expect(comment.time).toBeDefined();
                    expect(comment.body).toBeDefined();
                    expect(comment.upVotes).toBeDefined();
                    expect(comment.downVotes).toBeDefined();
                }
            }
        });

        test('setSearchParams()', async () => {
            const { name, value } = ppomppu.searchTypes[0];
            const keyword = 'ㅋ';

            ppomppu.page.on('response', checkResponseStatus(200));
            ppomppu.setSearchParams = { type: name, keyword, value };
            posts = await ppomppu.changeBoard(ppomppu.boards[0]);

            expect(posts.length).not.toBe(0);
            expect(ppomppu.searchParams).toEqual({
                type: name,
                keyword,
                value: getSearchParams(value, keyword),
            });

            // clean up
            ppomppu.searchParams = {};
            ppomppu.page.removeListener('response', checkResponseStatus(200));
        });
    });
});
