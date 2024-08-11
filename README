# Putlocker TV Show downloader

This scripts collects all the streaming video URLs for all seasons of a TV show. These video content URLs are passed as a command line argument to the `yt-dlp` tool which downloads the videos. The output format of the content file is `Season/Episode Title`.

## Prerequisites

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) tool: This can be downloaded from [homebrew](https://formulae.brew.sh/formula/yt-dlp) as well. The script assumes the tool is on your path.
- [docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

## Setup

1. Clone this repository.
2. Go to the root directory: `cd putlocker-tv-show-downloader`.
3. Update the [.env](./env) file. In most cases you only want to update the `SEASON_URL`. By default, it's set to the Game of Thrones.
    - `SEASON_URL=/tv-show/game-of-thrones-season-1-hdr/VfihwuEN/3z4cdb7y`
4. Perform `npm run start` command.
5. If the program is successful, it will print the `yt-dlp` commands to the console.l
6. Copy the commands and execute them in the current directory.
