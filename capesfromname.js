const puppeteer = require('puppeteer');
const axios = require('axios');

async function getUUIDFromName(name) {
	let apiResponse = await axios.get('https://api.mojang.com/users/profiles/minecraft/' + name);
	return apiResponse.data.id;
}

async function getInfo(name) {
	const browser = await puppeteer.launch({args: ['--no-sandbox'], headless: true});
	const page = await browser.newPage();

	let uuid = await getUUIDFromName(name);

	console.log(uuid);

	console.log('Loading namemc...');
	await page.goto('https://namemc.com/profile/' + uuid);

	let info = {
		name: '',
		mojangCapes: [],
		hasOptifineCape: false,
		nameHistory: []
	};

	let capes;

	try {
		capes = await page.$eval('body > main > div > div.col-lg-4.order-lg-1 > div:nth-child(4) > div.card-body.text-center', e => e.innerHTML);
		capes = capes.split('title="'); capes.shift();

		for (let i = 0; i < capes.length; i++) {
			capes[i] = capes[i].split('"')[0];
		}
	} catch (e) {
		capes = [];
	}

	if (await page.$('body > main > div > div.col-lg-4.order-lg-1 > div:nth-child(4) > div.card-body.text-center') !== null) {
		info.hasOptifineCape = `http://s.optifine.net/capes/${name}.png`;
	}

	let nameHistory = await page.$eval('body > main > div > div.col-lg-8.order-lg-2 > div:nth-child(4) > div.card-body.py-1', e => e.innerHTML);

	nameHistory = nameHistory.split('href="/name/'); nameHistory.shift();

	for (let i = 0; i < nameHistory.length; i++) {
		nameHistory[i] = nameHistory[i].split('"')[0];
	}

	info.name = name;
	info.mojangCapes = capes;
	info.nameHistory = nameHistory;

	await browser.close();

	return info;
}

async function example() {
	console.log(await getInfo('xsd'));
}

// example();

module.exports.getCapes = getInfo;
