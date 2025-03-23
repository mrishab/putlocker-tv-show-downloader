# Putlocker TV Show Downloader

A Node.js application that automates the process of collecting streaming video URLs for TV shows from Putlocker and generates commands to download them using yt-dlp. The application organizes downloaded content in a structured format: `Season/Episode Title`.

## Features

- Automatically scrapes TV show seasons and episodes from Putlocker
- Generates ready-to-use yt-dlp commands for downloading
- Organizes content in a clean season/episode structure
- Runs in a containerized environment for consistency and portability

## Prerequisites

- [Docker](https://www.docker.com/get-started) - For running the application in a container
- [Docker Compose](https://docs.docker.com/compose/install/) - For orchestrating the container
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - For downloading the video content
  - Can be installed via [Homebrew](https://formulae.brew.sh/formula/yt-dlp) on macOS: `brew install yt-dlp`
  - Make sure it's available on your system PATH

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/putlocker-tv-show-downloader.git
   cd putlocker-tv-show-downloader
   ```

2. Create a `.env` file in the root directory (or modify the existing one) with the following parameters:
   ```
   PUTLOCKER_SITE=https://putlockerwebsite.com
   DOWNLOADS_DIR=./downloads
   SEASON_URL=/tv-show/game-of-thrones-season-1-hdr/VfihwuEN/3z4cdb7y
   DEBUG_PORT=9229
   ```

   The most important value to modify is `SEASON_URL`, which should point to the TV show you want to download.

## Usage

1. Start the application using npm:
   ```
   npm run start
   ```

2. The application will scrape all episodes of all seasons available for the TV show and generate yt-dlp commands.

3. Once the process completes, you'll see a list of download commands in the console output.

4. Copy these commands and run them in your terminal to start downloading the episodes:
   ```
   yt-dlp https://example.com/video-url -o downloads/Season 1/Episode 1 Title
   ```

## Example Output

```
yt-dlp https://cdn-server.com/abcd1234.mp4 -o downloads/Season 1/Winter Is Coming
yt-dlp https://cdn-server.com/efgh5678.mp4 -o downloads/Season 1/The Kingsroad
...
```

## Troubleshooting

- **No episodes found**: Make sure the `SEASON_URL` in your .env file is correct and points to a valid TV show page.
- **Download errors**: Ensure yt-dlp is properly installed and updated to the latest version.
- **Docker issues**: Check that Docker and Docker Compose are correctly installed and running on your system.

## Legal Disclaimer

This tool is intended for personal use only. Users are responsible for ensuring they comply with copyright laws and the terms of service of any websites they interact with. The authors do not endorse or promote the downloading of copyrighted content without permission.

## License

[MIT](LICENSE)
