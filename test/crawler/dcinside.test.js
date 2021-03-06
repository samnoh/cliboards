const Dcinside = require('../../src/crawler/dcinside');
const {
    baseUrl,
    boardTypes,
    boards,
    filterOptions,
    search: { types: searchTypes, getSearchParams },
} = require('../../src/crawler/dcinside/constants');
const { checkResponseStatus } = require('../helpers/page');

let dcinside;

beforeAll(async () => {
    dcinside = new Dcinside();
    dcinside.resetBoards();
    await dcinside.start();
});

afterAll(async () => {
    dcinside.resetBoards();
    await dcinside.close();
});

describe('Dcinside', () => {
    describe('properties', () => {
        test('baseUrl', () => {
            expect(dcinside.baseUrl).toEqual(baseUrl);
        });

        test('title', () => {
            expect(dcinside.title).toEqual('dcinside');
        });

        test('boardTypes', () => {
            expect(dcinside.boardTypes).toEqual(boardTypes);
        });

        test('searchTypes', () => {
            expect(dcinside.searchTypes).toEqual(searchTypes);
        });

        test('filterOptions', () => {
            expect(dcinside.filterOptions).toEqual(filterOptions);
        });
    });

    describe('methods', () => {
        let posts;

        test('getBoards()', async () => {
            await dcinside.getBoards();
            expect(
                dcinside.boards.filter(b => b.type === dcinside.boardTypes[0]),
            ).toEqual(boards);
        });

        test('getPosts()', async () => {
            posts = await dcinside.changeBoard(dcinside.boards[2]);
            expect(posts.length).not.toBe(0);

            const firstPost = posts[0];
            expect(firstPost.title).toBeDefined();
            expect(firstPost.id).toBeDefined();
            // expect(firstPost.category).toBeDefined();
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
                const post = await dcinside.getPostDetail(postWithComments);
                expect(post.author).toBeDefined();
                expect(post.title).toBeDefined();
                expect(post.body).toBeDefined();
                expect(post.hit).toBeDefined();
                expect(post.time).toBeDefined();
                expect(post.upVotes).toBeDefined();
                expect(post.downVotes).toBeDefined();
                expect(post.comments).toBeDefined();

                const comment = post.comments[0];
                if (comment) {
                    expect(comment.isReply).toBeDefined();
                    expect(comment.isRemoved).toBeDefined();
                    expect(comment.author).toBeDefined();
                    expect(comment.time).toBeDefined();
                    expect(comment.body).toBeDefined();
                }
            }
        });

        test('addBoard() - handle board id', async () => {
            await dcinside.addBoard('dog', dcinside.boardTypes[1]);
            await dcinside.getBoards();

            expect(
                dcinside.boards.filter(b => b.type === dcinside.boardTypes[1])
                    .length,
            ).toEqual(1);
        });

        test('addBoard() - handle url', async () => {
            await dcinside.addBoard(
                'https://gall.dcinside.com/mgallery/board/lists/?id=bulsichak',
                dcinside.boardTypes[2],
            );
            await dcinside.getBoards();

            const newBoard = dcinside.boards.filter(
                a => a.type === dcinside.boardTypes[2],
            )[0];
            expect(newBoard.name).toEqual('사랑의 불시착');
            expect(newBoard.value).toEqual('bulsichak');
            expect(newBoard.type).toEqual(dcinside.boardTypes[2]);
        });

        test('addBoard() - handle mobile url', async () => {
            await dcinside.addBoard(
                `${baseUrl}/board/minergalls`,
                dcinside.boardTypes[2],
            );
            await dcinside.getBoards();

            const newBoard = dcinside.boards.filter(
                a => a.type === dcinside.boardTypes[2],
            )[1];
            expect(newBoard.name).toEqual('마이너 갤러리');
            expect(newBoard.value).toEqual('minergalls');
            expect(newBoard.type).toEqual(dcinside.boardTypes[2]);
        });

        test('addBoard() - handle error', async () => {
            try {
                await dcinside.addBoard('test', dcinside.boardTypes[0]);
                expect(false).toBeTruthy(); // always fail
            } catch (e) {
                expect(e.message).toEqual('Error: Response status is 404');
            }
        });

        test('setSearchParams()', async () => {
            const { name, value } = dcinside.searchTypes[0];
            const keyword = 'ㅋ';

            dcinside.page.on('response', checkResponseStatus(200));
            dcinside.setSearchParams = { type: name, keyword, value };
            posts = await dcinside.changeBoard(dcinside.boards[0]);

            expect(posts.length).not.toBe(0);
            expect(dcinside.searchParams).toEqual({
                type: name,
                keyword,
                value: getSearchParams(value, keyword),
            });

            // clean up
            dcinside.searchParams = {};
            dcinside.page.removeListener('response', checkResponseStatus(200));
        });
    });
});
