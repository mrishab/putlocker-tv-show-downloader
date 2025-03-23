const axios = require('axios')
const cheerio = require('cheerio');

function getConfig() {
    return {
        site: process.env['PUTLOCKER_SITE'],
        downloadsDir: process.env['DOWNLOADS_DIR'],
        seasonUrl: process.env['SEASON_URL'],
    }
}

function generateRandomString(length) {
    return Math.random().toString(20).substring(2, length + 2);
}

async function getSeasonLinkMap(site, link) {
    const url = `${site}${link}`;
    const { data } =  await axios.get(url);

    const $ = cheerio.load(data);
    
    const seasonLinkSelector = 'a[data-number^="Season"]';
    const seasonLinkElements = $(seasonLinkSelector);

    const seasonLinkMap = {};
    seasonLinkElements.each((i, el) => {
        el = $(el);
        seasonLinkMap[el.attr('data-number')] = el.attr('href');
    });

    return seasonLinkMap;
}

async function getSeasonEpisodesLinkMap(site, seasonLinkMap) {
    const linkSuffix = '-watch-online.html';
    const epLinkSelector = 'a[data-ep-id]:not([data-ep-id=""])';

    const seasonEpisodeLinkMap = {};
    const promises = Object.entries(seasonLinkMap).map(async ([season, link]) => {
        try {
            const url = `${site}${link}`;
            const {data} = await axios.get(url);
            const $ = cheerio.load(data);

            const episodeLinkElements = $(epLinkSelector);

            episodeLinkElements.each((_, el) => {
                el = $(el);
                seasonEpisodeLinkMap[season] ??= {};

                const link = el.attr('href');
                const partialLink = link.replace(linkSuffix, '/' + generateRandomString(8));
                seasonEpisodeLinkMap[season][el.attr('title')] =  partialLink + linkSuffix;
            });

            return seasonEpisodeLinkMap;
        } catch(err) {
            console.log(err);
        }
    });

    await Promise.all(promises);

    return seasonEpisodeLinkMap;
}

function decryptResponse(string, key='113', res='') {
    for (var i = 0; i < string.length; ) {
        for (var j = 0; (j < key.toString().length && i < string.length); j++,
        i++) {
            res += String.fromCharCode(string[i].charCodeAt(0) ^ key.toString()[j].charCodeAt(0))
        }
    }
    return res
}

async function getServerLink(site, link, params) {
    const headers = {
        "accept": "text/plain, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "cookie": "advanced-frontendputlocker2=s9hb0okih2gpqdfhevndfckc11; _csrf-frontend=018836e1ed085ee135d47ebb6e705854df0659473c8955a94ec1804b29f57ac6a%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22_0FCp8t8Jgk176cBcel9faE2c-uyrakV%22%3B%7D; _pk_id.20.7cd8=d5500389c36fa413.1723349153.; _pk_ses.20.7cd8=1; pp_main_16633e2fb85477d24998cab8f1cd2da1=1; sb_main_a8ea795e3801c0fd1c64af565dc2c662=1; dom3ic8zudi28v8lr6fgphwffqoz0j6c=d146af52-db10-479a-a2f3-3a50d6333529%3A3%3A1; _tezer_top=140028a2d7586e0251c922cfd40871e8f1dd672c4277431df4f3c754fae0b398a%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22_tezer_top%22%3Bi%3A1%3Bs%3A11%3A%22top_tezer_1%22%3B%7D; _tezer_bottom=bb38b2eba5c32029dad809e53282108b30e30cf45c389f0e593a9f182a4cf584a%3A2%3A%7Bi%3A0%3Bs%3A13%3A%22_tezer_bottom%22%3Bi%3A1%3Bs%3A14%3A%22bottom_tezer_1%22%3B%7D; _push=03c0f21e0a4b7e72365d5295ec965b823c15b6c9a5fa93d5be373e9823be760aa%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_push%22%3Bi%3A1%3Bs%3A10%3A%22web_push_1%22%3B%7D; _pops2=3c890338b088477576af16f169aa29ebe339f55140cacc4b70e9731716166bc1a%3A2%3A%7Bi%3A0%3Bs%3A6%3A%22_pops2%22%3Bi%3A1%3Bs%3A8%3A%22pop_up_2%22%3B%7D; _on_page=c9762995acea821b227bbae0b1f3403374e8bffe1e77121db39bc123316c3e55a%3A2%3A%7Bi%3A0%3Bs%3A8%3A%22_on_page%22%3Bi%3A1%3Bs%3A8%3A%22onpage_1%22%3B%7D; sb_count_a8ea795e3801c0fd1c64af565dc2c662=3; pp_sub_16633e2fb85477d24998cab8f1cd2da1=3; m5a4xojbcp2nx3gptmm633qal3gzmadn=mindedallergyclaim.com",
        "Referer": `${site}${link}`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    const url = `${site}${link}${params}`;
    try {
        const { data } = await axios.get(url, { headers });
        // Replace browser-specific atob with Node.js Buffer solution
        const decoded = Buffer.from(data, 'base64').toString('binary');
        const decrypted = decryptResponse(decoded);
        const serverLinks = JSON.parse(decrypted);

        return serverLinks[0];
    } catch (error) {
        console.error(`Error fetching server link from ${url}:`, error.message);
        throw error;
    }
}

async function getDownloadCommands(site, seasonEpisodeLinkMap, downloadsDir) {
    const promises = Object.entries(seasonEpisodeLinkMap).flatMap(([season, episodeLinkMap]) => {
        return Object.entries(episodeLinkMap).map(async ([title, episodeLink]) => {
            try {
                const contentSrcLink = await getServerLink(site, episodeLink, '?server=server_2&_=' + Math.random() * 1000000000);
                return `yt-dlp ${contentSrcLink} -o "${downloadsDir}/${season}/${title}"`;
            } catch (err) {
                console.error(`Failed to get download command for ${season}/${title}:`, err.message);
                return undefined;
            }
        }) 
    });

    const commands = await Promise.all(promises);
    return commands.filter(cmd => cmd != undefined);
}

async function main() {
    try {
        console.log("Starting the download process...");
        const config = getConfig();
        console.log(`Using Putlocker site: ${config.site}`);
        console.log(`Processing season URL: ${config.seasonUrl}`);
        
        const seasonLinkMap = await getSeasonLinkMap(config.site, config.seasonUrl);
        console.log(`Found ${Object.keys(seasonLinkMap).length} seasons`);
        
        const seasonEpisodeLinkMap = await getSeasonEpisodesLinkMap(config.site, seasonLinkMap);
        console.log(`Extracted episode links for all seasons`);
        
        const downloadCommands = await getDownloadCommands(config.site, seasonEpisodeLinkMap, config.downloadsDir);
        console.log(`Generated ${downloadCommands.length} download commands:`);
        
        downloadCommands.forEach(cmd => console.log(cmd));
        return downloadCommands;
    } catch (error) {
        console.error("An error occurred in the main process:", error);
        throw error;
    }
}

main().then(() => console.log('Success')).catch(err => {
    console.error('Failed with error:', err);
});