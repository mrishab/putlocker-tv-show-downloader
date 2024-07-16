const axios = require('axios')
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');


async function getSeasonLinkMap(site, link) {
    const url = `${site}${link}`;
    const { data } =  await axios.get(url);

    const $ = cheerio.load(data);
    
    const seasonLinkSelector = 'a[data-number^="Season"]';
    const seasonLinkElements = $(seasonLinkSelector);

    const seasonLinkMap = {};
    seasonLinkElements.each((i, el) => {
        el = $(el);
        seasonLinkMap[el.attr("data-number")] = el.attr("href");
    });

    return seasonLinkMap;
}

async function getSeasonEpisodesLinkMap(site, seasonLinkMap) {
    const seasonEpisodeLinkMap = {};
    const epLinkSelector = 'a[data-ep-id]:not([data-ep-id=""])';
    const promises = Object.entries(seasonLinkMap).map(async ([season, link]) => {
        try {
            const url = `${site}${link}`;
            const {data} = await axios.get(url);
            const $ = cheerio.load(data);

            const episodeLinkElements = $(epLinkSelector);

            episodeLinkElements.each((_, el) => {
                el = $(el);
                seasonEpisodeLinkMap[season] ??= {};
                seasonEpisodeLinkMap[season][el.attr("title")] = el.attr("href");
            });
        } catch(err) {
            console.log(err);
        }
    });

    await Promise.all(promises);
    return seasonEpisodeLinkMap;
}

async function getDownloadCommands(site, seasonEpisodeLinkMap) {
    const ytCommands = [];
    const browser = await puppeteer.launch({ headless: false });
    const promises = Object.entries(seasonEpisodeLinkMap).flatMap(([season, episodeLinkMap]) => {
        return Object.entries(episodeLinkMap).map(async ([title, episodeLink]) => {
            try {
                const url = `${site}${episodeLink}`;

                const page = await browser.newPage();
                await page.goto(url);
                
                const videoElementSelector = 'video';
                await page.waitForSelector(videoElementSelector);

                const videoElement = await page.$(videoElementSelector);

                let contentSrcLink;
                if (videoElement) {
                    contentSrcLink = await page.evaluate(video => video.getAttribute('src'), videoElement);
                    ytCommands.push(`yt-dlp ${contentSrcLink} -o ${season}/${title}`)
                } else {
                    console.log(`Video element not found for url: ${url}`);
                }

                page.close();
            } catch (err) {
                console.log(err);
            }
        }) 
    });

    await Promise.all(promises);

    return ytCommands;
}

async function main() {
    const site = "https://ww2.putlocker.style";
    const seasonUrl = '/tv-show/game-of-thrones-season-1-hdr/VfihwuEN/3z4cdb7y'
    const seasonLinkMap = await getSeasonLinkMap(site, seasonUrl);
    const seasonEpisodeLinkMap = await getSeasonEpisodesLinkMap(site, seasonLinkMap);
    const downloadCommands = await getDownloadCommands(site, seasonEpisodeLinkMap);

    console.log(downloadCommands);
}

main().then(() => console.log("Success")).catch(console.log);