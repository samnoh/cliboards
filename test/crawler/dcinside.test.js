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

describe('Dcinside class properties', () => {
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

describe('Dcinside class methods', () => {
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

    test('addBoard()', async () => {
        await dcinside.addBoard('cat', dcinside.boardTypes[0]);
        await dcinside.getBoards();
        await dcinside.addBoard('dog', dcinside.boardTypes[1]);
        await dcinside.getBoards();

        console.log(dcinside.boards);

        expect(
            dcinside.boards.filter(b => b.type === dcinside.boardTypes[0])
                .length,
        ).toEqual(5);
        expect(
            dcinside.boards.filter(b => b.type === dcinside.boardTypes[1])
                .length,
        ).toEqual(1);
    });
});
