# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-beta.116] - 2020-08-10

### Fixed

-   names in image viewer for `Ruliweb`

## [1.0.0-beta.115] - 2020-08-03

### Updated

-   image viewer can open youtube links in `PPOMPPU` which are not embedded

## [1.0.0-beta.108] - 2020-07-28

### Added

-   add posts to favorites from history page
-   reset post favorites
    ```bash
    cliboards --resetFav
    ```

### Updated

-   press `q` to cancel search posts
    -   removed `c` to cancel search results

## [1.0.0-beta.106] - 2020-07-27

### Added

-   search for boards (press `w` key)

## [1.0.0-beta.103] - 2020-07-24

### Added

-   hot galleries & minor galleries lists (흥갤) in `dcinside` to browse them easily
    -   see board list page number 4 and 5

## [1.0.0-beta.100] - 2020-07-23

### Added

-   search for posts in favorites and post history pages

### Updated

-   time format
-   some help messages
-   default `dcinside` galleries

### Fixed

-   url displays in posts in `clien`

## [1.0.0-beta.99] - 2020-07-23

### Added

-   hide top and/or bottom bars
    ```bash
    cliboards --fullScreen
    cliboards --hideTopBar
    cliboards --hideBottomBar
    ```

### Updated

-   cli option `--noComments` is changed to `--hideComments`
    ```bash
    cliboards --hideComments
    ```
-   puppeteer version (v5.1.0)
-   required node verson (>=10.18.1)

## [1.0.0-beta.98] - 2020-07-22

### Added

-   hide comments to browse posts quickly
    ```bash
    cliboards --noComments
    ```
-   new color option
    -   list_new_post_bg (green)
    -   removed list_new_post_color instead

### Fixed

-   if the number of comments is 0, the number does not disappear in post list

## [1.0.0-beta.96] - 2020-07-21

### Added

-   post filters by keyword
    -   to add/remove filters
        ```bash
        cliboards --filter
        ```

## [1.0.0-beta.95] - 2020-07-20

### Added

-   loading spinner in the right of footer box
-   image indicator in `ruliweb` comments

### Fixed

-   gif indicator in `clien`

## [1.0.0-beta.90] - 2020-07-14

### Fixed

-   sorting by '개념글' (recommended posts) is not working for some `dcinside` gallaries

## [1.0.0-beta.88] - 2020-07-14

### Fixed

-   `dcinside` comment format
-   issues with the cursor in the input box
-   the input box disappears after an empty string is entered
-   partial display of comment replies

## [1.0.0-beta.86] - 2020-07-14

### Added

-   update time format in posts and comments except `slrclub`
-   update upper box styles and info format
-   new color options
    -   top_info_likes (green)
    -   top_info_dislikes (red); `dcinside` only for now

## [1.0.0-beta.85] - 2020-07-14

### Added

-   source in `ruliweb`

### Fixed

-   remove strange string (`.screen_out`) in `ruliweb` posts

## [1.0.0-beta.84] - 2020-07-14

### Added

-   support `ruliweb` history and favorites

## [1.0.0-beta.82] - 2020-07-13

### Added

-   on the board selection page, press `h` to view post history
    -   post history is erased once you quit the app
-   press `shift + right` or `shift + left` to browse prev/next five pages

## [1.0.0-beta.81] - 2020-07-13

### Added

-   source in `clien`
-   reverse favorite orders

## [1.0.0-beta.80] - 2020-07-12

### Added

-   you can add posts to favorites
    -   on the post detail page
        -   press `a` to add the current post
        -   press `d` to delete the current post
    -   on the board selection page
        -   press `f` to view list

## [1.0.0-beta.79] - 2020-07-09

### Fixed

-   `dcinside` url

## [1.0.0-beta.74] - 2020-07-06

### Added

-   recommended posts in `dcinside`
-   auto close option in image viewer

## [1.0.0-beta.71] - 2020-07-03

### Fixed

-   wrong body format in post detail in `dcinside`, `dvdprime` and `ppomppu`

## [1.0.0-beta.70] - 2020-07-03

### Fixed

-   `enter` input while auto-refreshing may cause error

## [1.0.0-beta.68] - 2020-07-03

### Added

-   new comments indicator
-   new color option
    -   comment_new_color (green)

## [1.0.0-beta.67] - 2020-07-02

### Added

-   new posts indicator
-   new color option
    -   list_new_post_color (green)

### Fixed

-   indicator for posts that user has read is not properly shown

## [1.0.0-beta.65] - 2020-06-24

### Added

-   reply levels in `DVDPrime`
-   format links in `DVDPrime`

### Fixed

-   post & comment format in `DVDPrime`
-   remove series display in `DVDPrime`

## [1.0.0-beta.64] - 2020-06-24

### Added

-   `shift + s` to go back to prev sort filter in post list
-   `shift + r` to refresh and then scroll to the bottom in post detail page
-   automatically close exsiting image viewer once it opens new image viewer

### Fixed

-   left swipe cannot work properly in board list
-   controlable when hiding screen

## [1.0.0-beta.63] - 2020-06-23

### Fixed

-   `Ruliweb` notice post error

## [1.0.0-beta.61] - 2020-06-23

### Added

-   spoiler protection (`v` to view contents)
-   add command-line argument: `--disableSP`
    -   `--disableSP`: disable spoiler protection

### Fixed

-   new color error when search

## [1.0.0-beta.60] - 2020-06-22

### Added

-   new color options
    -   top_left_info_color (gray)
    -   top_left_search_keyword_color (blue)
    -   top_left_search_info_color (gray)
-   search filter indicator on search result screen

## [1.0.0-beta.58] - 2020-06-19

### Added

-   YouTube indicator
-   embed YouTube videos in image viewer

### Fixed

-   `DVDPrime` gif indiciator

## [1.0.0-beta.57] - 2020-06-18

### Added

-   new buttons in image viewer

## [1.0.0-beta.56] - 2020-06-18

### Added

-   `Ruliweb` search
-   new color options for text and button input

### Fixed

-   search params cannot reset when going back

## [1.0.0-beta.54] - 2020-06-17

### Added

-   GitHub ribbon in image viewer

### Fixed

-   temp files empty bug again
-   image viewer cannot work properly if switching from mp4 to gif/image or vice versa

## [1.0.0-beta.53] - 2020-06-16

### Added

-   display 101 or more comments in `Ruliweb`

### Fixed

-   temp files empty bug

## [1.0.0-beta.52] - 2020-06-16

### Added

-   image zoom-in in image viewer

### Fixed

-   gif loading error in `Ruliweb`

## [1.0.0-beta.48] - 2020-06-15

### Added

-   update image viewer

### Fixed

-   mp4 and gif indicators

## [1.0.0-beta.47] - 2020-06-15

### Added

-   add new image viewer

### Fixed

-   `dcinside` gif indicator

## [1.0.0-beta.46] - 2020-06-13

### Added

-   hide screen anywhere (`space` key)

## [1.0.0-beta.45] - 2020-06-12

### Added

-   `PPOMPPU` search

### Updated

-   puppeteer version (v3.3.0)

## [1.0.0-beta.44] - 2020-06-11

### Added

-   `DVDPrime` search

## [1.0.0-beta.42] - 2020-06-11

### Added

-   `dcinside` search

## [1.0.0-beta.41] - 2020-06-10

### Added

-   command-line arguments: `--theme`, `--reset`, `coumminty index | name`
    -   `--theme`: update theme
    -   `--reset`: reset data
    -   `community index | name`: open community directly

## [1.0.0-beta.40] - 2020-06-10

### Added

-   more distinguishable indicators for sorting boards and auto-refresh
-   gif/image indicators for comments in `CLIEN`
-   display 201 or more comments in `CLIEN`

## [1.0.0-beta.37] - 2020-06-09

### Added

-   [CHANGELOG.md](CHANGELOG.md)

### Updated

-   update [README.md](README.md)

### Fixed

-   auto refresh bug

[1.0.0-beta.116]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.116
[1.0.0-beta.115]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.115
[1.0.0-beta.108]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.108
[1.0.0-beta.106]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.106
[1.0.0-beta.103]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.103
[1.0.0-beta.100]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.100
[1.0.0-beta.99]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.99
[1.0.0-beta.98]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.98
[1.0.0-beta.96]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.96
[1.0.0-beta.95]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.95
[1.0.0-beta.90]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.90
[1.0.0-beta.88]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.88
[1.0.0-beta.86]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.86
[1.0.0-beta.85]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.85
[1.0.0-beta.84]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.84
[1.0.0-beta.82]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.82
[1.0.0-beta.81]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.81
[1.0.0-beta.80]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.80
[1.0.0-beta.79]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.79
[1.0.0-beta.74]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.74
[1.0.0-beta.71]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.71
[1.0.0-beta.70]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.70
[1.0.0-beta.68]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.68
[1.0.0-beta.67]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.67
[1.0.0-beta.65]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.65
[1.0.0-beta.64]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.64
[1.0.0-beta.63]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.63
[1.0.0-beta.61]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.61
[1.0.0-beta.60]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.60
[1.0.0-beta.58]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.58
[1.0.0-beta.57]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.57
[1.0.0-beta.56]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.56
[1.0.0-beta.54]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.54
[1.0.0-beta.53]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.53
[1.0.0-beta.52]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.52
[1.0.0-beta.48]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.48
[1.0.0-beta.47]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.47
[1.0.0-beta.46]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.46
[1.0.0-beta.45]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.45
[1.0.0-beta.44]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.44
[1.0.0-beta.42]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.42
[1.0.0-beta.41]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.41
[1.0.0-beta.40]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.40
[1.0.0-beta.37]: https://github.com/samnoh/cliboards/releases/tag/v1.0.0-beta.37
