const Clien = require('../../src/crawler/clien');
const {
    baseUrl,
    boardTypes,
    sortUrls,
} = require('../../src/crawler/clien/constants');

let clien;

beforeAll(async () => {
    clien = new Clien();
    clien.resetBoards();
    await clien.start();
});

afterAll(async () => {
    await clien.close();
});

describe('Clien', () => {
    describe('properties', () => {
        test('baseUrl', () => {
            expect(clien.baseUrl).toEqual(baseUrl);
        });

        test('title', () => {
            expect(clien.title).toEqual('Clien');
        });

        test('boardTypes', () => {
            expect(clien.boardTypes).toEqual(boardTypes);
        });

        test('sortUrls', () => {
            expect(clien.sortUrls).toEqual(sortUrls);
        });
    });

    describe('methods', () => {
        let posts;

        test('getBoards()', async () => {
            await clien.getBoards();

            expect(
                clien.boards.filter(b => b.type === '커뮤니티').length,
            ).toEqual(11);
        });

        test('getPosts()', async () => {
            posts = await clien.changeBoard(clien.boards[0]);

            expect(posts.length).not.toBe(0);
        });

        test('getPostDetail()', async () => {
            const post = await clien.getPostDetail(posts[0]);

            expect(post.category).not.toBeUndefined();
            expect(post.author).toBeTruthy();
            expect(post.title).toBeTruthy();
            expect(post.body).toBeTruthy();
            expect(post.hit).toBeTruthy();
            expect(post.time).toBeTruthy();
            expect(Array.isArray(post.comments)).toBeTruthy();
        });

        test('processComments()', async () => {
            const postWithComments = posts.find(p => p.numberOfComments);
            const post = await clien.getPostDetail(postWithComments);
            const comment = post.comments[0];

            expect(comment.id).toBeTruthy();
            expect(comment.author).toBeTruthy();
            expect(comment.body).toBeTruthy();
            expect(comment.time).toBeTruthy();
        });

        test('getAllComments()', async () => {
            const post = await clien.getPostDetail(posts[0]);
            const allComments = await clien.getAllComments();

            expect(allComments.length).toEqual(post.comments.length);
        });
    });
});
