const Dvdprime = require('../../src/crawler/dvdprime/');
const {
    baseUrl,
    boardTypes,
    boards,
    search: { types: searchTypes, getSearchParams },
} = require('../../src/crawler/dvdprime/constants');
const { checkResponseStatus } = require('../helpers/page');

let dvdprime;

beforeAll(async () => {
    dvdprime = new Dvdprime();
    dvdprime.resetBoards();
    await dvdprime.start();
});

afterAll(async () => {
    await dvdprime.close();
});

describe('DVDPrime', () => {
    describe('properties', () => {
        test('baseUrl', () => {
            expect(dvdprime.baseUrl).toEqual(baseUrl);
        });

        test('title', () => {
            expect(dvdprime.title).toEqual('DVDPrime');
        });

        test('boardTypes', () => {
            expect(dvdprime.boardTypes).toEqual(boardTypes);
        });

        test('searchTypes', () => {
            expect(dvdprime.searchTypes).toEqual(searchTypes);
        });
    });

    describe('methods', () => {
        let posts;

        test('getBoards()', async () => {
            await dvdprime.getBoards();

            expect(dvdprime.boards).toEqual(boards);
        });

        test('getPosts()', async () => {
            posts = await dvdprime.changeBoard(dvdprime.boards[0]);
            expect(posts.length).not.toBe(0);

            const firstPost = posts[0];
            expect(firstPost.title).toBeDefined();
            expect(firstPost.id).toBeDefined();
            expect(firstPost.category).toBeDefined();
            expect(firstPost.author).toBeDefined();
            expect(firstPost.hit).toBeDefined();
            expect(firstPost.time).toBeDefined();
            expect(firstPost.link).toBeDefined();
            expect(firstPost.upVotes).toBeDefined();
            expect(firstPost.numberOfComments).toBeDefined();
            expect(firstPost.hasImages).toBeDefined();
        });

        test('getPostDetail()', async () => {
            const postWithComments = posts.find(p => p.numberOfComments);

            if (postWithComments) {
                const post = await dvdprime.getPostDetail(postWithComments);

                expect(post.author).toBeDefined();
                expect(post.title).toBeDefined();
                expect(post.body).toBeDefined();
                expect(post.hit).toBeDefined();
                expect(post.time).toBeDefined();
                expect(post.upVotes).toBeDefined();
                expect(Array.isArray(post.comments)).toBeDefined();

                const comment = post.comments[0];
                if (comment) {
                    expect(comment.isReply).toBeDefined();
                    expect(comment.isRemoved).toBeDefined();
                    expect(comment.author).toBeDefined();
                    expect(comment.time).toBeDefined();
                    expect(comment.body).toBeDefined();
                    expect(comment.upVotes).toBeDefined();
                }
            }
        });

        test('setSearchParams()', async () => {
            const { name, value } = dvdprime.searchTypes[0];
            const keyword = '영화';

            dvdprime.page.on('response', checkResponseStatus(200));
            dvdprime.setSearchParams = { type: name, keyword, value };
            posts = await dvdprime.changeBoard(dvdprime.boards[0]);

            expect(posts.length).not.toBe(0);
            expect(dvdprime.searchParams).toEqual({
                type: name,
                keyword,
                value: getSearchParams(value, keyword),
            });

            // clean up
            dvdprime.searchParams = {};
            dvdprime.page.removeListener('response', checkResponseStatus(200));
        });
    });
});
