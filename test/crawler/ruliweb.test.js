const Ruliweb = require('../../src/crawler/ruliweb');
const {
    baseUrl,
    boardTypes,
    boards,
} = require('../../src/crawler/ruliweb/constants');

let ruliweb;

beforeAll(async () => {
    ruliweb = new Ruliweb();
    ruliweb.resetBoards();
    await ruliweb.start();
});

afterAll(async () => {
    await ruliweb.close();
});

describe('Ruliweb', () => {
    describe('properties', () => {
        test('baseUrl', () => {
            expect(ruliweb.baseUrl).toEqual(baseUrl);
        });

        test('title', () => {
            expect(ruliweb.title).toEqual('Ruliweb');
        });

        test('boardTypes', () => {
            expect(ruliweb.boardTypes).toEqual(boardTypes);
        });
    });

    describe('methods', () => {
        let posts;

        test('getBoards()', async () => {
            await ruliweb.getBoards();

            expect(ruliweb.boards).toEqual(boards);
        });

        test('getPosts()', async () => {
            posts = await ruliweb.changeBoard(ruliweb.boards[0]);
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
                const post = await ruliweb.getPostDetail(postWithComments);
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
