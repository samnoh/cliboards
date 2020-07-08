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
        });

        test('getPostDetail()', async () => {
            const post = await dvdprime.getPostDetail(posts[0]);

            expect(post.author).toBeTruthy();
            expect(post.title).toBeTruthy();
            expect(post.body).toBeTruthy();
            expect(post.hit).toBeTruthy();
            expect(post.time).toBeTruthy();
            expect(post.upVotes).not.toBeUndefined();
            expect(Array.isArray(post.comments)).toBeTruthy();
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
