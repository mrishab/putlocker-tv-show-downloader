const axios = require('axios')
const cheerio = require("cheerio");

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
        seasonLinkMap[el.attr("data-number")] = el.attr("href");
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

                const link = el.attr("href");
                const partialLink = link.replace(linkSuffix, "/" + generateRandomString(8));
                seasonEpisodeLinkMap[season][el.attr("title")] =  partialLink + linkSuffix;
            });

            return seasonEpisodeLinkMap;
        } catch(err) {
            console.log(err);
        }
    });

    await Promise.all(promises);

    return seasonEpisodeLinkMap;
}

function decryptResponse(string, key="88", res="") {
    for (var i = 0; i < string.length; ) {
        for (var j = 0; (j < "113".toString().length && i < string.length); j++,
        i++) {
            res += String.fromCharCode(string[i].charCodeAt(0) ^ "113".toString()[j].charCodeAt(0))
        }
    }
    return res
}

async function getServerLink(site, link, params) {
    const headers = {
        "accept": "text/plain, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "cookie": "advanced-frontendputlocker2=1dltqq0h0vnif6gq0v1lm47a67; _csrf-frontend=3b75456a8392c7ae395e25c3aa482b605244b98e64583bb96ec493a08ea27506a%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22cfEWPess9tTiZzpMSAsnWn2No01JSohr%22%3B%7D; _pk_ref.20.7cd8=%5B%22%22%2C%22%22%2C1721103523%2C%22https%3A%2F%2Fduckduckgo.com%2F%22%5D; _pk_id.20.7cd8=e17db1442321f94a.1721103523.; _pk_ses.20.7cd8=1; _tezer_top=140028a2d7586e0251c922cfd40871e8f1dd672c4277431df4f3c754fae0b398a%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22_tezer_top%22%3Bi%3A1%3Bs%3A11%3A%22top_tezer_1%22%3B%7D; _tezer_bottom=bb38b2eba5c32029dad809e53282108b30e30cf45c389f0e593a9f182a4cf584a%3A2%3A%7Bi%3A0%3Bs%3A13%3A%22_tezer_bottom%22%3Bi%3A1%3Bs%3A14%3A%22bottom_tezer_1%22%3B%7D; _push=03c0f21e0a4b7e72365d5295ec965b823c15b6c9a5fa93d5be373e9823be760aa%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_push%22%3Bi%3A1%3Bs%3A10%3A%22web_push_1%22%3B%7D; _pops2=3c890338b088477576af16f169aa29ebe339f55140cacc4b70e9731716166bc1a%3A2%3A%7Bi%3A0%3Bs%3A6%3A%22_pops2%22%3Bi%3A1%3Bs%3A8%3A%22pop_up_2%22%3B%7D; _on_page=c9762995acea821b227bbae0b1f3403374e8bffe1e77121db39bc123316c3e55a%3A2%3A%7Bi%3A0%3Bs%3A8%3A%22_on_page%22%3Bi%3A1%3Bs%3A8%3A%22onpage_1%22%3B%7D; _csrf-frontend=8869e4595d817be851d04614a4394db5da732643e64920c758604f121ecad3eca%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%22XmW31Thy3PbadCzt-b__1mt53fHxzcz7%22%3B%7D; _on_page=c9762995acea821b227bbae0b1f3403374e8bffe1e77121db39bc123316c3e55a%3A2%3A%7Bi%3A0%3Bs%3A8%3A%22_on_page%22%3Bi%3A1%3Bs%3A8%3A%22onpage_1%22%3B%7D; _pops2=3c890338b088477576af16f169aa29ebe339f55140cacc4b70e9731716166bc1a%3A2%3A%7Bi%3A0%3Bs%3A6%3A%22_pops2%22%3Bi%3A1%3Bs%3A8%3A%22pop_up_2%22%3B%7D; _push=03c0f21e0a4b7e72365d5295ec965b823c15b6c9a5fa93d5be373e9823be760aa%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_push%22%3Bi%3A1%3Bs%3A10%3A%22web_push_1%22%3B%7D; _tezer_bottom=bb38b2eba5c32029dad809e53282108b30e30cf45c389f0e593a9f182a4cf584a%3A2%3A%7Bi%3A0%3Bs%3A13%3A%22_tezer_bottom%22%3Bi%3A1%3Bs%3A14%3A%22bottom_tezer_1%22%3B%7D; _tezer_top=140028a2d7586e0251c922cfd40871e8f1dd672c4277431df4f3c754fae0b398a%3A2%3A%7Bi%3A0%3Bs%3A10%3A%22_tezer_top%22%3Bi%3A1%3Bs%3A11%3A%22top_tezer_1%22%3B%7D; advanced-frontendputlocker2=97jgq9hckvuj4sq76eo3em6p50",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "referer": `${site}${link}`,
        "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "x-requested-with": "XMLHttpRequest"
    };

    const url = `${site}${link}${params}`;
    const { data } = await axios.get(url, headers);
    const decoded = atob(data);
    const decrypted = decryptResponse(decoded);
    const serverLinks = JSON.parse(decrypted);

    return serverLinks[0];
}

async function getDownloadCommands(site, seasonEpisodeLinkMap) {
    const promises = Object.entries(seasonEpisodeLinkMap).flatMap(([season, episodeLinkMap]) => {
        return Object.entries(episodeLinkMap).map(async ([title, episodeLink]) => {
            try {
                const contentSrcLink = await getServerLink(site, episodeLink, '?server=server_1&_=' + Math.random() * 1000000000);
                return `yt-dlp ${contentSrcLink} -o ${season}/${title}`;
            } catch (err) {
                console.log(err);
            }
        }) 
    });

    const commands = await Promise.all(promises);
    return commands.filter(cmd => cmd != undefined);
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