const express = require('express');
const api = require('./dataapp');
const requesthandler = express();

requesthandler.get('/info', async (req, res) => {
	let name = req._parsedUrl.query.split('name=')[1];
	let data = await api.getInfo(name);
	res.send(data);
});

requesthandler.listen(80, () => console.log('Unofficial NameMC API is up!'));
