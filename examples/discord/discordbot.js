const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');

const details = require('./bot_details.json');

client.on('ready', () => {
	console.log('Ready!');
});

client.on('message', async msg => {
	let message = msg.content;
	if (msg.author.bot === true) return;
	if (!message.startsWith('$')) return;
	message = message.substring(1, message.length);
	if (message.startsWith('info')) {
		let username = message.split(' ')[1];
		let api_data = (await axios.get('http://127.0.0.1/info?name=' + username)).data;
		console.log(api_data);
		for (let i = 0; i < api_data.accounts.length; i++) {
			let current_account = api_data.accounts[i];
			for (let j = 0; j < current_account.nameHistory.length; j++) {
				current_account.nameHistory[j] = current_account.nameHistory[j].replace(/_/g, '\\_');
			}
		    let embed = new Discord.MessageEmbed()
				.setTitle(current_account.name.replace(/_/g, '\\_'))
				.setThumbnail('https://crafatar.com/renders/body/' + current_account.uuid)
				.addField('Username', current_account.name.replace(/_/g, '\\_'))
				.addField('Duped', api_data.dupedInfo[0] ? `True (${api_data.dupedInfo[1] === i ? 'Original' : 'Not Original'})` : 'False')
				.addField('NameMC', 'https://mine.ly/' + current_account.uuid)
				.addField('Offical Capes', current_account.officialCapes.length === 0 ? 'N/A' : current_account.officialCapes)
				.addField('Optifine Cape', current_account.optifineCape.length === 0 ? 'N/A' : current_account.optifineCape)
				.addField('Name Changes', current_account.nameHistory.length-1)
		        .addField('Name History', current_account.nameHistory)
				.addField('Unmigrated', current_account.unmigrated ? 'True' : 'False');
		    await msg.channel.send(embed);
		}
	}
});

client.login(details.login);
