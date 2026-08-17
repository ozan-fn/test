const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const PORT = 8080;
let child;

function get(p, method, headers, body) {
  return new Promise((r) => {
    const q = http.request({ host: "127.0.0.1", port: PORT, path: p, method, headers }, (res) => {
      let b = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (b += c));
      res.on("end", () => r({ statusCode: res.statusCode, headers: res.headers, body: b }));
    });
    q.on("error", (e) => r({ error: e }));
    if (body) q.write(body);
    q.end();
  });
}

function up() {
  return new Promise((r) => {
    const bin = path.join(os.tmpdir(), "main");
    fs.copyFileSync(path.join(__dirname, "../../main"), bin);
    fs.chmodSync(bin, 0o755);
    child = spawn(bin, [], { env: { ...process.env, PORT: String(PORT) } });
    child.stderr.on("data", (d) => console.error("[go]", d.toString()));
    child.on("exit", (c) => { console.error("[go] exited", c); child = null; });
    const t = Date.now() + 5000;
    (function p() {
      get("/").then((res) => res.error ? (Date.now() > t ? r() : setTimeout(p, 100)) : r());
    })();
  });
}

exports.handler = async (event) => {
  if (!child || child.exitCode !== null) await up();
  const res = await get(event.path, event.httpMethod, event.headers, event.body);
  if (res.error) return { statusCode: 502, body: String(res.error) };
  return { statusCode: res.statusCode, headers: res.headers, body: res.body };
};