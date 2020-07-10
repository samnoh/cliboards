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
            const post = await clien.getPostDetail(posts[0]);

            expect(post.category).toBeDefined();
            expect(post.author).toBeDefined();
            expect(post.title).toBeDefined();
            expect(post.body).toBeDefined();
            expect(post.hit).toBeDefined();
            expect(post.time).toBeDefined();
            expect(post.comments).toBeDefined();
        });

        test('processComments()', async () => {
            const postWithComments = posts.find(p => p.numberOfComments);
            if (postWithComments) {
                const post = await clien.getPostDetail(postWithComments);
                const comment = post.comments.find(c => !c.isRemoved);

                if (comment) {
                    expect(comment.isReply).toBeDefined();
                    expect(comment.isRemoved).toBeDefined();
                    expect(comment.author).toBeDefined();
                    expect(comment.body).toBeDefined();
                    expect(comment.time).toBeDefined();
                    expect(comment.upVotes).toBeDefined();
                    expect(comment.id).toBeDefined();
                }
            }
        });

        test('getAllComments()', async () => {
            const post = await clien.getPostDetail(posts[0]);
            const allComments = await clien.getAllComments();

            expect(allComments.length).toEqual(post.comments.length);
        });
    });
});
