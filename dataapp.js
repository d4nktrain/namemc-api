const needle = require('needle');

async function genResponse(name) {
	let info = {
		dupedInfo: [false, -1],
		accounts: [],
	};

	// Duped
	let searchPage = (await needle('https://namemc.com/search?q=' + name)).body.toLowerCase();
	if (searchPage.includes('error: 429 (too many requests)')) return 'ERROR: 429';
	let dupeHeaders = searchPage.split('<a href="/profile/' + name.toLowerCase());
	dupeHeaders.shift();
	for (let i = 0; i < dupeHeaders.length; i++) {
		dupeHeaders[i] = dupeHeaders[i].split('"')[0];
	}

	if (dupeHeaders.length > 1) info.dupedInfo = [true, dupeHeaders.length-1];

	for (let i = 0; i < dupeHeaders.length; i++) {
		info.accounts.push(await getInfo(name + dupeHeaders[i], searchPage));
	}
	if (info.accounts.length === 0) return 'ERROR: 404';

	return info;
}

async function getInfo(name_and_number, searchPage) {
	// let uuid = (await axios.get('https://api.mojang.com/users/profiles/minecraft/' + name)).data.id.insertDashes([8, 13, 18, 23]);
	// if (uuid === undefined) return 'Invalid name';
	// info.uuid = uuid;

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
		let htmlContent = (await needle('https://namemc.com/profile/' + name_and_number)).body;

		if (htmlContent.includes('Found. Redirecting to ')) htmlContent = (await needle('https://namemc.com' + htmlContent.split('to ')[1])).body;

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
