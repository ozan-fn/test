import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    Referer: "https://www.tiktok.com/",
    Cookie: fs.readFileSync(path.join(__dirname, "./cookies.txt"), "utf-8"),
};

(async function () {
    const html = (await axios.get("https://www.tiktok.com/@yanz.kerjo.tok/video/7346491977610923269", { headers })).data;
    const $ = cheerio.load(html);
    const json = JSON.parse($("#__UNIVERSAL_DATA_FOR_REHYDRATION__").text());

    const link = json["__DEFAULT_SCOPE__"]["webapp.video-detail"]["itemInfo"]["itemStruct"]["video"]["playAddr"];

    const buffer = (await axios(link, { method: "GET", headers, responseType: "arraybuffer" })).data;
    console.log(buffer);
})();
