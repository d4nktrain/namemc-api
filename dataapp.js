const axios = require('axios');

async function genResponse(name, proxyIn) {
	let info = {
		dupedInfo: [false, -1],
		accounts: [],
	};

	const axiosConfig = {
		url: 'https://namemc.com/search?q=' + name,
		method: 'get'
	};

	if (proxyIn !== undefined) axiosConfig['proxy'] = {
		host: proxyIn.host,
		port: proxyIn.port
	};

	console.log(axiosConfig);

	// Duped
	let searchPage;
	try {
		searchPage = (await axios.request(axiosConfig)).data.toLowerCase();
		if (searchPage.includes('error: 429 (too many requests)')) return 'ERROR: 429';
		let dupeHeaders = searchPage.split('<a href="/profile/' + name.toLowerCase());
		dupeHeaders.shift();
		for (let i = 0; i < dupeHeaders.length; i++) {
			dupeHeaders[i] = dupeHeaders[i].split('"')[0];
		}

		if (dupeHeaders.length > 1) info.dupedInfo = [true, dupeHeaders.length-1];

		for (let i = 0; i < dupeHeaders.length; i++) {
			info.accounts.push(await getInfo(name + dupeHeaders[i], searchPage, proxyIn));
		}
		if (info.accounts.length === 0) return 'ERROR: 404';

		return info;
	} catch (e) {
		console.log(e);
		if (String(e).includes('Error: Request failed with status code 429')) return 'ERROR: 429';
	}
}

async function getInfo(name_and_number, searchPage, proxyIn) {
	let account_info = {
		name: '',
		officialCapes: [],
		optifineCape: '',
		nameHistory: [],
		uuid: '',
		unmigrated: false,
		prename: false
	};

	try {
		const axiosConfig = {
			method: 'get',
		};

		if (proxyIn !== undefined) axiosConfig['proxy'] = {
			host: proxyIn.host,
			port: proxyIn.port
		};

		axiosConfig['url'] = 'https://namemc.com/profile/' + name_and_number;
		let htmlContent = (await axios.request(axiosConfig)).data;

		axiosConfig['url'] = 'https://namemc.com' + htmlContent.split('to ');
		if (htmlContent.includes('Found. Redirecting to ')) htmlContent = (await axios.request(axiosConfig)).data;

		// Name
		let capitalizedName = htmlContent.split('<main class="container">\n')[1].split('>')[1].split('</')[0];
		if (capitalizedName.includes('<img ')) capitalizedName = capitalizedName.split('<img ')[0];
		account_info.name = capitalizedName;

		// Name History
		let nameHistory = htmlContent.split('<div class="card-body py-1" style="overflow-y: auto; max-height: 10rem">')[1].split('href="/name/');
		nameHistory.shift();
		for (let i = 0; i < nameHistory.length; i++) {
			nameHistory[i] = nameHistory[i].split('"')[0];
		}
		account_info.nameHistory = nameHistory;

		// OptiFine Cape
		if (htmlContent.includes('OptiFine</a> Cape</strong>')) account_info.optifineCape = `http://s.optifine.net/capes/${capitalizedName}.png`;

		// Offical Capes
		if (htmlContent.includes('/cape/')) {
			let capes = htmlContent.split('/cape/');
			capes.shift();
			for (let i = 0; i < capes.length; i++) {
				capes[i] = capes[i].split('title="')[1].split('"')[0];
			}
			account_info.officialCapes = capes;
		}

		// UUID
		account_info.uuid = htmlContent.split('<strong>UUID</strong>')[1].split('data-clipboard-text="')[1].split('"')[0].replace(/-/g, '');

		// Migration Status
		account_info.unmigrated = htmlContent.includes('https://help.mojang.com/customer/portal/articles/775905-migrating-from-minecraft-to-mojang');

		// Prename
		account_info.prename = searchPage.includes('<p class="text-muted">profiles: 1 result</p>');

		return account_info;
	} catch (e) {
		return 'UNKNOWN ERROR OCCURRED';
	}
}

module.exports.getInfo = genResponse;
