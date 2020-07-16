const Slrclub = require('../../src/crawler/slrclub');
const {
    baseUrl,
    boardTypes,
    boards,
} = require('../../src/crawler/slrclub/constants');

let slrclub;

beforeAll(async () => {
    slrclub = new Slrclub();
    slrclub.resetBoards();
    await slrclub.start();
});

afterAll(async () => {
    await slrclub.close();
});

describe('SLRClub', () => {
    describe('properties', () => {
        test('baseUrl', () => {
            expect(slrclub.baseUrl).toEqual(baseUrl);
        });

        test('title', () => {
            expect(slrclub.title).toEqual('SLRClub');
        });

        test('boardTypes', () => {
            expect(slrclub.boardTypes).toEqual(boardTypes);
        });
    });

    describe('methods', () => {
        let posts;

        test('getBoards()', async () => {
            await slrclub.getBoards();

            expect(slrclub.boards).toEqual(boards);
        });

        test('getPosts()', async () => {
            posts = await slrclub.changeBoard(slrclub.boards[0]);
            expect(posts.length).not.toBe(0);

            const firstPost = posts[0];
            expect(firstPost.title).toBeDefined();
            expect(firstPost.link).toBeDefined();
            expect(firstPost.time).toBeDefined();
            expect(firstPost.author).toBeDefined();
            expect(firstPost.hit).toBeDefined();
            expect(firstPost.upVotes).toBeDefined();
            expect(firstPost.numberOfComments).toBeDefined();
        });

        test('getPostDetail()', async () => {
            const postWithComments = posts.find(p => p.numberOfComments);

            if (postWithComments) {
                const post = await slrclub.getPostDetail(postWithComments);
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
                }
            }
        });
    });
});
