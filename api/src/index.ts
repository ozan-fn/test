import Fastify, { FastifyRequest } from "fastify";
import fs from "fs";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import staticServe from "@fastify/static";

const fastify = Fastify({ logger: true });

fastify.get("/tiktok", async function handler(request: FastifyRequest<{ Querystring: { url?: string; download?: boolean } }>, reply) {
    var url = request.query.url;
    var donwnload = request.query.download;

    if (!url) {
        reply.statusCode = 404;
        return { error: "URL not provided" };
    }

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
        Referer: "https://www.tiktok.com/",
        Cookie: fs.readFileSync(path.join(__dirname, "../cookies.txt"), "utf-8"),
    };

    var html = (await axios.get(url, { headers })).data;
    var $ = cheerio.load(html);
    var json = JSON.parse($("#__UNIVERSAL_DATA_FOR_REHYDRATION__").text());

    url = json["__DEFAULT_SCOPE__"]["seo.abtest"]["canonical"];
    html = (await axios.get(url!, { headers })).data;
    $ = cheerio.load(html);
    json = JSON.parse($("#__UNIVERSAL_DATA_FOR_REHYDRATION__").text());

    const link = json["__DEFAULT_SCOPE__"]["webapp.video-detail"]["itemInfo"]["itemStruct"]["video"]["playAddr"];

    const buffer = (await axios(link, { method: "GET", headers, responseType: "stream" })).data;

    console.log("\n" + donwnload);
    if (donwnload) {
        reply.header("Content-disposition", "attachment; filename=" + "request.body.filename.mp4");
        reply.type("application/octet-stream");
    }
    return buffer;
});

fastify.register(staticServe, {
    root: path.join(__dirname, "../../dist"),
});

fastify.listen({ port: 3000 });
