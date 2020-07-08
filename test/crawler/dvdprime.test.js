const Dvdprime = require('../../src/crawler/dvdprime/');

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
            expect(dvdprime.baseUrl).toEqual('https://dvdprime.com');
        });

        test('title', () => {
            expect(dvdprime.title).toEqual('DVDPrime');
        });

        test('boardTypes', () => {
            expect(dvdprime.boardTypes).toEqual([
                '영화‧드라마‧음악',
                '홈시어터',
                '커뮤니티',
            ]);
        });

        test('searchTypes', () => {
            expect(dvdprime.searchTypes).toEqual([
                {
                    name: '제목',
                    value: 'wr_subject',
                },
                {
                    name: '제목+내용',
                    value: 'wr_subject%7C%7Cwr_content',
                },
                {
                    name: '내용',
                    value: 'wr_content',
                },
                {
                    name: '닉네임(본문)',
                    value: 'wr_name',
                },
                {
                    name: '닉네임(코멘트)',
                    value: 'wr_name%2C0',
                },
                {
                    name: '아이디(본문)',
                    value: 'mb_id%2C1',
                },
                {
                    name: '아이디(코멘트)',
                    value: 'mb_id%2C0',
                },
            ]);
        });
    });

    describe('methods', () => {
        let posts;

        test('getBoards()', async () => {
            await dvdprime.getBoards();

            expect(dvdprime.boards.length).toEqual(10);
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
    });
});
