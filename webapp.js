const express = require('express');
const yoinker = require('./dataapp');
const webapp = express();

webapp.get('/info', async (req, res) => {
	let name = req._parsedUrl.query.split('name=')[1];
	res.send(await yoinker.getInfo(name));
});

webapp.listen(80, () => console.log(`Unofficial NameMC API is up!`));
