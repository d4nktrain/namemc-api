const express = require('express');
const api = require('./dataapp');
const requesthandler = express();

requesthandler.get('/info', async (req, res) => {
	let name = req._parsedUrl.query.split('name=')[1];
	res.send(await api.getInfo(name));
});

requesthandler.listen(80, () => console.log('Unofficial NameMC API is up!'));
