const express = require('express');
const api = require('./dataapp');
const requesthandler = express();

requesthandler.get('/info', async (req, res) => {
	let name = req._parsedUrl.query.split('name=')[1];
	let data = await api.getInfo(name);
	if (typeof data === 'string') if (data.includes('ERROR: 429')) data = await api.getInfo(name);
	res.send(data);
});

requesthandler.listen(9080, () => console.log('Unofficial NameMC API is up!'));
