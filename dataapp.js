const needle = require('needle');
const axios = require('axios');

String.prototype.insertDashes=function(indexes) {
	let returnString = this;
	for (let i = 0; i < indexes.length; i++) {
		returnString = returnString.substring(0, indexes[i]) + '-' + returnString.substring(indexes[i]);
	}
	return returnString;
};

async function getUUIDFromName(name) {
	let apiResponse = await axios.get('https://api.mojang.com/users/profiles/minecraft/' + name);
	try {
		return apiResponse.data.id.insertDashes([8, 13, 18, 23]);
	} catch (e) {}
}

async function getInfo(name) {
	let info = {
		name: '',
		officialCapes: [],
		optifineCape: '',
		nameHistory: []
	};

	let uuid = await getUUIDFromName(name);
	if (uuid === undefined) return 'Invalid name';

	let htmlContent = await needle('https://namemc.com/profile/' + uuid);

	// Name
	let capitalizedName = htmlContent.body.split(`<main class="container">\n`)[1].split(`>`)[1].split('</')[0];
	if (capitalizedName.includes('<img ')) capitalizedName = capitalizedName.split('<img ')[0];
	info.name = capitalizedName;

	// Name History
	let nameHistory = htmlContent.body.split('<div class="card-body py-1" style="overflow-y: auto; max-height: 10rem">')[1].split('href="/name/');
	nameHistory.shift();
	for (let i = 0; i < nameHistory.length; i++) {
		nameHistory[i] = nameHistory[i].split('"')[0];
	}
	info.nameHistory = nameHistory;

	// OptiFine Cape
	if (htmlContent.body.includes('OptiFine</a> Cape</strong>')) info.optifineCape = `http://s.optifine.net/capes/${capitalizedName}.png`;

	// Offical Capes
	if (htmlContent.body.includes('/cape/')) {
		let capes = htmlContent.body.split('/cape/');
		capes.shift();
		for (let i = 0; i < capes.length; i++) {
			capes[i] = capes[i].split('title="')[1].split('"')[0];
		}
		info.officialCapes = capes;
	}

	return info;
}

module.exports.getInfo = getInfo;
