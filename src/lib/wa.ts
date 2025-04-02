import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState, proto } from "baileys";
import path from "path";
import pino from "pino";
import NodeCache from "@cacheable/node-cache";
import { Boom } from "@hapi/boom";

const logger = pino({ level: "silent" });
const msgRetryCounterCache = new NodeCache();

let sock: any; // Global reference for socket

async function main() {
	const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, "../../baileys_auth_info"));
	const { version, isLatest } = await fetchLatestBaileysVersion();
	console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

	sock = makeWASocket({
		version,
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		printQRInTerminal: true,
		msgRetryCounterCache,
		markOnlineOnConnect: false,
	});

	sock.ev.on("creds.update", saveCreds);

	sock.ev.on("connection.update", (update: { connection: string; lastDisconnect: { error: Boom<any> } }) => {
		if (update.connection === "close") {
			if ((update.lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
				main();
			} else {
				console.log("Connection closed. You are logged out.");
			}
		}
	});
}

export async function sendMessage(chatId: string, text: string) {
	if (!sock) throw new Error("Socket not initialized");
	await sock.sendMessage(chatId, { text });
}

export async function sendVideo(chatId: string, videoBuffer: Buffer, caption?: string) {
	if (!sock) throw new Error("Socket not initialized");
	await sock.sendMessage(chatId, { video: videoBuffer, caption });
}

export async function sendPhoto(chatId: string, imageBuffer: Buffer, caption?: string) {
	if (!sock) throw new Error("Socket not initialized");
	await sock.sendMessage(chatId, { image: imageBuffer, caption });
}

main();

// Example usage outside the `main` function
// sendMessage("123456789@s.whatsapp.net", "Hello!");
// sendVideo("123456789@s.whatsapp.net", fs.readFileSync("video.mp4"), "Check this video!");
// sendPhoto("123456789@s.whatsapp.net", fs.readFileSync("photo.jpg"), "Here's a photo!");
