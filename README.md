# cliboards &middot; [![npm version](https://img.shields.io/npm/v/cliboards?color=brightgreen)](https://www.npmjs.com/package/cliboards) [![npm downloads](https://img.shields.io/npm/dm/cliboards?color=red)](https://npm-stat.com/charts.html?package=cliboards) [![GitHub license](https://img.shields.io/npm/l/cliboards?color=lightgrey)](LICENSE) [![GitHub last commit](https://img.shields.io/github/last-commit/samnoh/cliboards?color=blue)](https://github.com/samnoh/cliboards/commits/master)

> Surf your online communities on CLI

![screenshot](img/screenshot-01.jpg)

## Features

-   Communities: `Clien`, `dcinside`, `DVDPrime`, `Ruliweb`, `PPOMPPU` and `SLRClub`
-   Supports color customizations
-   Loads faster with a slow Internect connection
-   Shurtcut for viewing images on web browser
-   Spoiler protection
-   Search posts
-   Hide screen instantly (`space` key)

## Installation

Use the package manager [npm](https://www.npmjs.com) to install `cliboards`.

```bash
# Install globally (recommended).
npm i -g cliboards

# Or run directly with npx (installs CLI on every run).
npx cliboards
```

## Usage

```bash
# Display a list of community
cliboards

# Display the nth community (1 is the first)
cliboards <index>

# Display community for given name
cliboards <name>

# Reset all data
cliboards --reset

# Reset data for given community only
cliboards <index|name> --reset

# Update theme (color customizations)
cliboards --theme

# Disable spoiler protection
cliboards --disableSP
```

## Changelog

[Read the changelog here](CHANGELOG.md)

## Contributing

Please do contribute! Issues and pull requests are all welcome.

### Code of Conduct

Please read the [full text](CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Licnese

[MIT licensed](LICENSE)
