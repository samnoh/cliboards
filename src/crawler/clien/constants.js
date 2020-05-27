const baseUrl = 'https://www.clien.net';

const boardTypes = ['커뮤니티', '소모임'];

module.exports = {
    baseUrl,
    getUrl: (boardName) => `${baseUrl}${boardName}?&po=`,
    sortUrls: [
        {
            name: '등록일순',
            value: '&od=T31',
        },
        {
            name: '공감순',
            value: '&od=T33',
        },
    ],
    boardTypes,
    ignoreBoards: ['사진게시판', '아무거나질문', '알뜰구매', '임시소모임'],
    ignoreRequests: ['image', 'stylesheet', 'media', 'font', 'imageset', 'script'],
    boards: [
        {
            name: '모두의공원',
            value: '/service/board/park',
            type: boardTypes[0],
        },
        {
            name: '새로운소식',
            value: '/service/board/news',
            type: boardTypes[0],
        },
        {
            name: '유용한사이트',
            value: '/service/board/useful',
            type: boardTypes[0],
        },
        {
            name: '자료실',
            value: '/service/board/pds',
            type: boardTypes[0],
        },
        {
            name: '팁과강좌',
            value: '/service/board/lecture',
            type: boardTypes[0],
        },
        {
            name: '사용기',
            value: '/service/board/use',
            type: boardTypes[0],
        },
        {
            name: '체험단사용기',
            value: '/service/board/chehum',
            type: boardTypes[0],
        },
        {
            name: '회원중고장터',
            value: '/service/board/sold',
            type: boardTypes[0],
        },
        {
            name: '날아올랑',
            value: '/service/board/cm_drone',
            type: boardTypes[1],
        },
        {
            name: '굴러간당',
            value: '/service/board/cm_car',
            type: boardTypes[1],
        },
        {
            name: '아이포니앙',
            value: '/service/board/cm_iphonien',
            type: boardTypes[1],
        },
        {
            name: '주식한당',
            value: '/service/board/cm_stock',
            type: boardTypes[1],
        },
        {
            name: 'MaClien',
            value: '/service/board/cm_mac',
            type: boardTypes[1],
        },
        {
            name: '자전거당',
            value: '/service/board/cm_bike',
            type: boardTypes[1],
        },
        {
            name: '내집마련당',
            value: '/service/board/cm_havehome',
            type: boardTypes[1],
        },
        {
            name: '방탄소년당',
            value: '/service/board/cm_bts',
            type: boardTypes[1],
        },
        {
            name: '골프당',
            value: '/service/board/cm_golf',
            type: boardTypes[1],
        },
        {
            name: '나스당',
            value: '/service/board/cm_nas',
            type: boardTypes[1],
        },
        {
            name: '안드로메당',
            value: '/service/board/cm_andro',
            type: boardTypes[1],
        },
        {
            name: '일본산당',
            value: '/service/board/cm_japanlive',
            type: boardTypes[1],
        },
        {
            name: '레고당',
            value: '/service/board/cm_lego',
            type: boardTypes[1],
        },
        {
            name: '동숲한당',
            value: '/service/board/cm_dongsup',
            type: boardTypes[1],
        },
        {
            name: '가상화폐당',
            value: '/service/board/cm_vcoin',
            type: boardTypes[1],
        },
        {
            name: '바다건너당',
            value: '/service/board/cm_oversea',
            type: boardTypes[1],
        },
        {
            name: '육아당',
            value: '/service/board/cm_baby',
            type: boardTypes[1],
        },
        {
            name: '사과시계당',
            value: '/service/board/cm_applewatch',
            type: boardTypes[1],
        },
        {
            name: '개발한당',
            value: '/service/board/cm_app',
            type: boardTypes[1],
        },
        {
            name: '냐옹이당',
            value: '/service/board/cm_cat',
            type: boardTypes[1],
        },
        {
            name: '축구당',
            value: '/service/board/cm_soccer',
            type: boardTypes[1],
        },
        {
            name: '콘솔한당',
            value: '/service/board/cm_console',
            type: boardTypes[1],
        },
        {
            name: '날아올랑',
            value: '/service/board/cm_drone',
            type: boardTypes[1],
        },
        {
            name: '클다방',
            value: '/service/board/cm_coffee',
            type: boardTypes[1],
        },
        {
            name: '덕질한당',
            value: '/service/board/cm_ku',
            type: boardTypes[1],
        },
        {
            name: '노젓는당',
            value: '/service/board/cm_rowing',
            type: boardTypes[1],
        },
        {
            name: '이륜차당',
            value: '/service/board/cm_mbike',
            type: boardTypes[1],
        },
        {
            name: '야구당',
            value: '/service/board/cm_baseball',
            type: boardTypes[1],
        },
        {
            name: '땀흘린당',
            value: '/service/board/cm_gym',
            type: boardTypes[1],
        },
        {
            name: '소셜게임한당',
            value: '/service/board/cm_werule',
            type: boardTypes[1],
        },
        {
            name: '리눅서당',
            value: '/service/board/cm_linux',
            type: boardTypes[1],
        },
        {
            name: '캠핑간당',
            value: '/service/board/cm_camp',
            type: boardTypes[1],
        },
        {
            name: 'IoT당',
            value: '/service/board/cm_iot',
            type: boardTypes[1],
        },
        {
            name: '갖고다닌당',
            value: '/service/board/cm_edc',
            type: boardTypes[1],
        },
        {
            name: '시계찬당',
            value: '/service/board/cm_watch',
            type: boardTypes[1],
        },
        {
            name: '패스오브엑자일당',
            value: '/service/board/cm_poe',
            type: boardTypes[1],
        },
        {
            name: '소시당',
            value: '/service/board/cm_girl',
            type: boardTypes[1],
        },
        {
            name: '퐁당퐁당',
            value: '/service/board/cm_swim',
            type: boardTypes[1],
        },
        {
            name: '라즈베리파이당',
            value: '/service/board/cm_rasp',
            type: boardTypes[1],
        },
        {
            name: '심는당',
            value: '/service/board/cm_plant',
            type: boardTypes[1],
        },
        {
            name: '디아블로당',
            value: '/service/board/cm_dia',
            type: boardTypes[1],
        },
        {
            name: '뽀록이당(당구)',
            value: '/service/board/cm_billiards',
            type: boardTypes[1],
        },
        {
            name: '스팀한당',
            value: '/service/board/cm_steam',
            type: boardTypes[1],
        },
        {
            name: '걸그룹당',
            value: '/service/board/cm_girlgroup',
            type: boardTypes[1],
        },
        {
            name: '그림그린당',
            value: '/service/board/cm_pic',
            type: boardTypes[1],
        },
        {
            name: '요리한당',
            value: '/service/board/cm_cook',
            type: boardTypes[1],
        },
        {
            name: '방송한당',
            value: '/service/board/cm_onair',
            type: boardTypes[1],
        },
        {
            name: '블랙베리당',
            value: '/service/board/cm_bb',
            type: boardTypes[1],
        },
        {
            name: 'e북본당',
            value: '/service/board/cm_ebook',
            type: boardTypes[1],
        },
        {
            name: '개판이당',
            value: '/service/board/cm_dog',
            type: boardTypes[1],
        },
        {
            name: '도시어부당',
            value: '/service/board/cm_fisher',
            type: boardTypes[1],
        },
        {
            name: 'LOLien',
            value: '/service/board/cm_lol',
            type: boardTypes[1],
        },
        {
            name: '하스스톤한당',
            value: '/service/board/cm_hearth',
            type: boardTypes[1],
        },
        {
            name: '빨콩이당',
            value: '/service/board/cm_thinkpad',
            type: boardTypes[1],
        },
        {
            name: '총쏜당',
            value: '/service/board/cm_gun',
            type: boardTypes[1],
        },
        {
            name: '적는당',
            value: '/service/board/cm_note',
            type: boardTypes[1],
        },
        {
            name: '블록체인당',
            value: '/service/board/cm_blockchain',
            type: boardTypes[1],
        },
        {
            name: '활자중독당',
            value: '/service/board/cm_book',
            type: boardTypes[1],
        },
        {
            name: '미드당',
            value: '/service/board/cm_midra',
            type: boardTypes[1],
        },
        {
            name: '창업한당',
            value: '/service/board/cm_venture',
            type: boardTypes[1],
        },
        {
            name: '땅판당',
            value: '/service/board/cm_mine',
            type: boardTypes[1],
        },
        {
            name: '물고기당',
            value: '/service/board/cm_fish',
            type: boardTypes[1],
        },
        {
            name: '대구당',
            value: '/service/board/cm_daegu',
            type: boardTypes[1],
        },
        {
            name: '리듬탄당',
            value: '/service/board/cm_rhythm',
            type: boardTypes[1],
        },
        {
            name: '이브한당',
            value: '/service/board/cm_eve',
            type: boardTypes[1],
        },
        {
            name: 'VR당',
            value: '/service/board/cm_vr',
            type: boardTypes[1],
        },
        {
            name: '가죽당',
            value: '/service/board/cm_leather',
            type: boardTypes[1],
        },
        {
            name: '문명하셨당',
            value: '/service/board/cm_civilize',
            type: boardTypes[1],
        },
        {
            name: '찰칵찍당',
            value: '/service/board/cm_photo',
            type: boardTypes[1],
        },
        {
            name: '스타한당',
            value: '/service/board/cm_star',
            type: boardTypes[1],
        },
        {
            name: '영화본당',
            value: '/service/board/cm_movie',
            type: boardTypes[1],
        },
        {
            name: '터치패드당',
            value: '/service/board/cm_tpad',
            type: boardTypes[1],
        },
        {
            name: '소리당',
            value: '/service/board/cm_music',
            type: boardTypes[1],
        },
        {
            name: '윈태블릿당',
            value: '/service/board/cm_slate',
            type: boardTypes[1],
        },
        {
            name: 'WOW당',
            value: '/service/board/cm_wow',
            type: boardTypes[1],
        },
        {
            name: '맛있겠당',
            value: '/service/board/cm_food',
            type: boardTypes[1],
        },
        {
            name: '나혼자산당',
            value: '/service/board/cm_solo',
            type: boardTypes[1],
        },
        {
            name: '패셔니앙',
            value: '/service/board/cm_fashion',
            type: boardTypes[1],
        },
        {
            name: '어학당',
            value: '/service/board/cm_lang',
            type: boardTypes[1],
        },
        {
            name: '볼링친당',
            value: '/service/board/cm_bowling',
            type: boardTypes[1],
        },
        {
            name: 'X세대당',
            value: '/service/board/cm_70',
            type: boardTypes[1],
        },
        {
            name: '배드민턴당',
            value: '/service/board/cm_badmin',
            type: boardTypes[1],
        },
        {
            name: '농구당',
            value: '/service/board/cm_basket',
            type: boardTypes[1],
        },
        {
            name: '곰돌이당',
            value: '/service/board/cm_bear',
            type: boardTypes[1],
        },
        {
            name: '보드게임당',
            value: '/service/board/cm_board',
            type: boardTypes[1],
        },
        {
            name: '클래시앙',
            value: '/service/board/cm_classic',
            type: boardTypes[1],
        },
        {
            name: '쿠키런당',
            value: '/service/board/cm_cookierun',
            type: boardTypes[1],
        },
        {
            name: 'FM한당',
            value: '/service/board/cm_fm',
            type: boardTypes[1],
        },
        {
            name: '젬워한당',
            value: '/service/board/cm_gemwar',
            type: boardTypes[1],
        },
        {
            name: '차턴당',
            value: '/service/board/cm_gta',
            type: boardTypes[1],
        },
        {
            name: '히어로즈한당',
            value: '/service/board/cm_heroes',
            type: boardTypes[1],
        },
        {
            name: '인스타한당',
            value: '/service/board/cm_instar',
            type: boardTypes[1],
        },
        {
            name: 'KARA당',
            value: '/service/board/cm_kara',
            type: boardTypes[1],
        },
        {
            name: 'Mabinogien',
            value: '/service/board/cm_mabi',
            type: boardTypes[1],
        },
        {
            name: '헌팅한당',
            value: '/service/board/cm_monhunt',
            type: boardTypes[1],
        },
        {
            name: '오른당',
            value: '/service/board/cm_mount',
            type: boardTypes[1],
        },
        {
            name: 'MTG한당',
            value: '/service/board/cm_mtg',
            type: boardTypes[1],
        },
        {
            name: '노키앙',
            value: '/service/board/cm_nokien',
            type: boardTypes[1],
        },
        {
            name: '소풍간당',
            value: '/service/board/cm_picnic',
            type: boardTypes[1],
        },
        {
            name: '품앱이당',
            value: '/service/board/cm_redeem',
            type: boardTypes[1],
        },
        {
            name: 'Sea마당',
            value: '/service/board/cm_sea',
            type: boardTypes[1],
        },
        {
            name: 'SimSim하당',
            value: '/service/board/cm_sim',
            type: boardTypes[1],
        },
        {
            name: '심야식당',
            value: '/service/board/cm_simsik',
            type: boardTypes[1],
        },
        {
            name: '미끄러진당',
            value: '/service/board/cm_snow',
            type: boardTypes[1],
        },
        {
            name: '파도탄당',
            value: '/service/board/cm_surfing',
            type: boardTypes[1],
        },
        {
            name: '공대시계당',
            value: '/service/board/cm_tiwatch',
            type: boardTypes[1],
        },
        {
            name: '여행을떠난당',
            value: '/service/board/cm_tour',
            type: boardTypes[1],
        },
        {
            name: '트윗당',
            value: '/service/board/cm_twit',
            type: boardTypes[1],
        },
        {
            name: 'WebOs당',
            value: '/service/board/cm_webos',
            type: boardTypes[1],
        },
        {
            name: '윈폰이당',
            value: '/service/board/cm_wp',
            type: boardTypes[1],
        },
    ],
};
