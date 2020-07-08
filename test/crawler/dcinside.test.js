const Dcinside = require('../../src/crawler/dcinside');

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
        test('title', () => {
            expect(dcinside.title).toEqual('dcinside');
        });

        test('boardTypes', () => {
            expect(dcinside.boardTypes).toEqual([
                '1 페이지',
                '2 페이지',
                '3 페이지',
            ]);
        });

        test('searchTypes', () => {
            expect(dcinside.searchTypes).toEqual([
                {
                    name: '전체',
                    value: 'all',
                },
                {
                    name: '제목',
                    value: 'subject',
                },
                {
                    name: '내용',
                    value: 'memo',
                },
                {
                    name: '글쓴이',
                    value: 'name',
                },
                {
                    name: '제목+내용',
                    value: 'subject_m',
                },
            ]);
        });

        test('filterOptions', () => {
            expect(dcinside.filterOptions).toEqual({
                activeFilterIndex: 0,
                filters: [
                    {
                        name: '전체',
                        value: '',
                    },
                    {
                        name: '개념글',
                        value: 'recommend=1',
                    },
                ],
            });
        });
    });

    describe('methods', () => {
        let posts;

        test('getBoards()', async () => {
            await dcinside.getBoards();
            expect(
                dcinside.boards.filter(b => b.type === dcinside.boardTypes[0])
                    .length,
            ).toEqual(4);
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
    });
});
