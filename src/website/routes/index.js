const { Router } = require('express'),
	os = require('os'),
	si = require('systeminformation'),
	{ stuff, formatBytes, getGuildHistory, getUserHistory, getReadableTime } = require('../../utils'),
	commands = require('../fakeData/commands.json'),
	commandOverview = require('../fakeData/CommandOverview.json'),
	router = Router();

let bandwidth = 0,
	load = 0;
const MemHistory = [],
	CPUHistory = [],
	BandHistory = [];
module.exports = (bot) => {
	// Home page
	setInterval(async function() {
		bandwidth = await stuff();
		load = await si.currentLoad().then(l => l.currentLoad);
		CPUHistory.push({ CPU: load, time: new Date() });
		MemHistory.push({ memory: process.memoryUsage(), time: new Date() });
		BandHistory.push({ data: bandwidth, time: new Date() });
	}, 2000);

	router.get('/', async (req, res) => {
		// render page
		const cmds = Object.entries(commands).slice(0, 24).sort((a, b) => b[1] - a[1]);
		const cmdOverviews = Object.entries(commandOverview).slice(0, 29).sort((a, b) => new Date(a[0]) - new Date(b[0]));
		const srvOverview = getGuildHistory(bot);
		const userOverview = getUserHistory(bot);
		res.render('index', {
			bot,
			BOT: {
				UPTIME: getReadableTime(bot.uptime),
				NAME: bot.user.tag,
				GUILDCOUNT: bot.guilds.cache.size,
				GUILDCOUNTTODAY: bot.guilds.cache.filter(g => g.me.joinedTimestamp >= new Date() - 86400000).size,
				USERCOUNT: bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString(),
			},
			MEMORY: {
				USAGE: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
				MAX: os.totalmem(),
			},
			CPU: Math.round(load),
			COMMANDUSAGE: (10000).toLocaleString('en-US'),
			NETWORK: formatBytes(BandHistory[BandHistory.length - 1]?.data ?? 0),
			GRAPHS: {
				CommandUsage: {
					labels: cmdOverviews.map(i => i[0]),
					datasets: [
						{
							label: 'Commands ran',
							data: cmdOverviews.map(i => i[1]),
						},
					],
				},
				PopularCommands: {
					labels: cmds.map(i => i[0]),
					datasets: [
						{
							label: 'Commands ran',
							data: cmds.map(i => i[1]),
						},
					],
				},
				ServerOverview: {
					labels: srvOverview.map(i => new Date(i.joinedAt).toLocaleString('en-GB')),
					datasets: [
						{
							label: 'Server count',
							data: srvOverview.map(i => i.count),
						},
					],
				},
				UserOverview: {
					labels: userOverview.map(i => new Date(i.joinedTimestamp).toLocaleString('en-GB')),
					datasets: [
						{
							label: 'User count',
							data: userOverview.map(i => i.count),
						},
					],
				},
				UserToBot: {
					labels: ['Humans', 'Bots'],
					datasets: [
						{
							data: [((bot.users.cache.filter(u => !u.bot).size / bot.users.cache.size) * 100).toFixed(1), ((bot.users.cache.filter(u => u.bot).size / bot.users.cache.size) * 100).toFixed(1)],
							backgroundColor: [
								'rgb(255, 99, 132)',
								'rgb(54, 162, 235)',
							],
						},
					],
				},
				MemoryUsage: {
					labels: MemHistory.slice(0, 24).map(i => i.time.toLocaleString('en-GB')),
					datasets: [
						{
							label: 'Memory Usage',
							data: MemHistory.slice(0, 24).map(({ memory }) => (memory.heapUsed / 1024 / 1024).toFixed(2)),
						},
					],
				},
				CPUUsage: {
					labels: CPUHistory.slice(0, 24).map(i => i.time.toLocaleString('en-GB')),
					datasets: [
						{
							label: 'CPU Usage',
							data: CPUHistory.slice(0, 24).map(i => i.CPU),
						},
					],
				},
				BandwidthUsage: {
					labels: BandHistory.slice(0, 24).map(i => i.time.toLocaleString('en-GB')),
					datasets: [
						{
							label: 'Bandwidth Usage',
							data: BandHistory.slice(0, 24).map(i => i.data),
						},
					],
				},
			},
		});
	});

	return router;
};
