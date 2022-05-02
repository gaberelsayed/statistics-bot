const { Client, Intents: { FLAGS } } = require('discord.js'),
	{ token } = require('./config.js');

const bot = new Client({
	partials: ['GUILD_MEMBER', 'USER', 'MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_SCHEDULED_EVENT'],
	intents: [FLAGS.GUILDS, FLAGS.GUILD_MEMBERS, FLAGS.GUILD_BANS, FLAGS.GUILD_EMOJIS_AND_STICKERS,
		FLAGS.GUILD_MESSAGES, FLAGS.GUILD_MESSAGE_REACTIONS, FLAGS.DIRECT_MESSAGES, FLAGS.GUILD_VOICE_STATES, FLAGS.GUILD_INVITES,
		FLAGS.GUILD_SCHEDULED_EVENTS],
});

bot.channelStats = {};
bot.voiceStats = {};

bot.on('ready', () => {
	bot.guilds.cache.forEach(async (guild) => {
		await guild.members.fetch();
	});

	require('./website')(bot);
});

bot.login(token);
