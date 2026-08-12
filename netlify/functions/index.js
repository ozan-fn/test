const { spawn } = require("child_process");
const http = require("http");
const { join } = require("path");
const { existsSync, copyFileSync, chmodSync } = require("fs");
const { tmpdir } = require("os");

let php = null; // Menyimpan proses background

exports.handler = async (event) => {
  const root = process.env.LAMBDA_TASK_ROOT || process.cwd();
  const tmpBin = join(tmpdir(), "frankenphp");

  // 1. Jalankan FrankenPHP jika belum menyala
  if (!php) {
    if (!existsSync(tmpBin)) {
      copyFileSync(join(root, "frankenphp"), tmpBin);
      chmodSync(tmpBin, "755"); // Fix hak akses
    }
    php = spawn(tmpBin, ["php-server", "-r", join(root, "phpMyAdmin-5.2.3-english"), "-l", "127.0.0.1:8080"], { cwd: root });
    await new Promise(r => setTimeout(r, 2000)); // Tunggu server siap
  }

  // 2. Teruskan trafik (Proxy)
  return new Promise((resolve) => {
    let reqPath = event.path;
    if (event.queryStringParameters) {
      reqPath += '?' + new URLSearchParams(event.queryStringParameters).toString();
    }

    const proxyHeaders = { ...event.headers };
    delete proxyHeaders["accept-encoding"]; // Fix Content Encoding Error

    const req = http.request({
      hostname: "127.0.0.1", port: 8080, path: reqPath, method: event.httpMethod, headers: proxyHeaders
    }, (res) => {
      let chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        const isBin = (res.headers["content-type"] || "").match(/image|font|octet-stream/i);
        
        // Pisahkan header teks biasa & header array (cookie phpMyAdmin)
        const single = {}, multi = {};
        for (const [k, v] of Object.entries(res.headers)) {
          Array.isArray(v) ? (multi[k] = v) : (single[k] = v);
        }

        resolve({
          statusCode: res.statusCode,
          headers: single,
          multiValueHeaders: multi,
          body: isBin ? buf.toString("base64") : buf.toString("utf8"),
          isBase64Encoded: !!isBin
        });
      });
    });

    req.on("error", () => {
      php = null; // Reset jika crash
      resolve({ statusCode: 502, body: "FrankenPHP Gateway Error" });
    });

    if (event.body) req.write(event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body);
    req.end();
  });
};