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
            posts = await dcinside.changeBoard(dcinside.boards[0]);

            expect(posts.length).not.toBe(0);
        });

        test('getPostDetail()', async () => {
            const post = await dcinside.getPostDetail(posts[0]);

            expect(post.author).toBeTruthy();
            expect(post.title).toBeTruthy();
            expect(post.body).toBeTruthy();
            expect(post.hit).toBeTruthy();
            expect(post.time).toBeTruthy();
            expect(Array.isArray(post.comments)).toBeTruthy();
        });

        test('addBoard() - handle board id', async () => {
            await dcinside.addBoard('cat', dcinside.boardTypes[0]);
            await dcinside.getBoards();
            await dcinside.addBoard('dog', dcinside.boardTypes[1]);
            await dcinside.getBoards();

            expect(
                dcinside.boards.filter(b => b.type === dcinside.boardTypes[0])
                    .length,
            ).toEqual(5);
            expect(
                dcinside.boards.filter(b => b.type === dcinside.boardTypes[1])
                    .length,
            ).toEqual(1);
        });

        test('addBoard() - handle url', async () => {
            await dcinside.addBoard(
                'https://gall.dcinside.com/mgallery/board/lists/?id=game_nintendo',
                dcinside.boardTypes[2],
            );
            await dcinside.getBoards();

            const newBoard = dcinside.boards[dcinside.boards.length - 1];
            expect(newBoard.name).toEqual('닌텐도');
            expect(newBoard.value).toEqual('game_nintendo');
            expect(newBoard.type).toEqual(dcinside.boardTypes[2]);
        });

        test('addBoard() - handle mobile url', async () => {
            await dcinside.addBoard(
                'https://m.dcinside.com/board/aoegame',
                dcinside.boardTypes[2],
            );
            await dcinside.getBoards();

            const newBoard = dcinside.boards[dcinside.boards.length - 1];
            expect(newBoard.name).toEqual('중세게임');
            expect(newBoard.value).toEqual('aoegame');
            expect(newBoard.type).toEqual(dcinside.boardTypes[2]);
        });

        test('addBoard() - handle error', async () => {
            try {
                await dcinside.addBoard('test', dcinside.boardTypes[0]);
                expect(false).toBeTruthy(); // always fail
            } catch (e) {
                expect(e.message).toEqual('Error: Response status is 403');
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
