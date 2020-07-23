const fs = require('fs');
const axios = require('axios');

let dictionary = fs.readFileSync(__dirname + '/2nameslist.txt').toString().replace(/\r/g, '').split('\n');
dictionary.pop();

let accountsJson = {};

try {accountsJson = require(__dirname + '/2names.json');}
catch (e) {}

console.log(accountsJson);

async function processData() {
	for (let i = 0; i < 5; i++) {
		await new Promise(async resolve => {
			console.log('Processing',dictionary[i]);
			let data = (await axios.get('http://127.0.0.1/info?name=' + dictionary[i])).data;
			data === 'ERROR: 404' ? data = null : accountsJson[dictionary[i]] = data;
			console.log(accountsJson[dictionary[i]]);
			if (accountsJson[dictionary[i]] === 'ERROR: 429') {await new Promise(resolve => setTimeout(() => resolve(), 30000)); i--;}
			fs.writeFile(__dirname + '/2names.json', JSON.stringify(accountsJson, null, 2), async () => {
				await new Promise(resolve => setTimeout(() => resolve(), 500));
				resolve();
			});
		});
	}
}

processData();
