const express = require('express');
const yoinker = require('./capesfromname');
const app = express();
const port = 80;

app.get('/info', async (req, res) => {
	let name = req._parsedUrl.query.split('name=')[1];
	res.send(await yoinker.getCapes(name));
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
