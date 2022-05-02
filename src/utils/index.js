const si = require('systeminformation');
let used_bytes = 0,
	bandwidth = 0;

module.exports = {
	stuff: async function() {
		// Set initial used network bytes count
		if (used_bytes <= 0) used_bytes = (await si.networkStats()).reduce((prev, current) => prev + current.rx_bytes, 0);

		// Calculate used bandwidth
		const used_bytes_latest = (await si.networkStats()).reduce((prev, current) => prev + current.rx_bytes, 0);
		bandwidth += used_bytes_latest - used_bytes;
		used_bytes = used_bytes_latest;
		return bandwidth;
	},
	formatBytes: function(bytes) {
		if (bytes == 0) return '0 Bytes';
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
			i = Math.floor(Math.log(bytes) / Math.log(1024));

		return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
	},
	getGuildHistory: function(bot) {
		let history = bot.guilds.cache.map(g => ({ id: g.id, joinedAt: g.me.joinedAt })).sort((a, b) => a.joinedAt - b.joinedAt);
		history = history.map(h => Object.assign({ count: history.indexOf(h) + 1 }, h));
		return history;
	},
	getUserHistory: function(bot) {
		const totalUsers = [];
		for (const guild of [...bot.guilds.cache.values()]) {
			totalUsers.push(...[...guild.members.cache.values()]);
		}
		const sortedUsers = totalUsers.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map(h => Object.assign({ count: totalUsers.indexOf(h) + 1 }, h));
		return sortedUsers;
	},
	getReadableTime: function(ms) {
		if (!ms || ms && !isFinite(ms)) {throw new TypeError('You need to pass a total number of milliseconds! (That number cannot be greater than Number limits)');}
		if (typeof ms !== 'number') {throw new TypeError(`You need to pass a number! Instead received: ${typeof ms}`);}
		const t = require('./index.js').getTimeObject(ms);
		const reply = [];
		if (t.years) 	reply.push(`${t.years} yrs`);
		if (t.months) reply.push(`${t.months} mo`);
		if (t.days) reply.push(`${t.days} d`);
		if (t.hours) reply.push(`${t.hours} hrs`);
		if (t.minutes) reply.push(`${t.minutes} min`);
		if (t.seconds) reply.push(`${t.seconds} sec`);
		return reply.length > 0 ? reply.join(', ') : '0sec';
	},
	getTimeObject: function(ms) {
		if (!ms || typeof ms !== 'number' || !isFinite(ms)) throw new TypeError('Final value is greater than Number can hold or you provided invalid argument.');
		const result = {
			years: 0,
			months: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: Math.floor(ms),
		};
			// Calculate time in rough way
		while (result.milliseconds >= 1000) {
			if (result.milliseconds >= 3.154e+10) {
				result.years++;
				result.milliseconds -= 3.154e+10;
			}
			if (result.milliseconds >= 2.592e+9) {
				result.months++;
				result.milliseconds -= 2.592e+9;
			}
			if (result.milliseconds >= 8.64e+7) {
				result.days++;
				result.milliseconds -= 8.64e+7;
			}
			if (result.milliseconds >= 3.6e+6) {
				result.hours++;
				result.milliseconds -= 3.6e+6;
			}
			if (result.milliseconds >= 60000) {
				result.minutes++;
				result.milliseconds -= 60000;
			}
			if (result.milliseconds >= 1000) {
				result.seconds++;
				result.milliseconds -= 1000;
			}
		}
		// Make it smooth, aka sort
		if (result.seconds >= 60) {
			result.minutes += Math.floor(result.seconds / 60);
			result.seconds = result.seconds - (Math.floor(result.seconds / 60) * 60);
		}
		if (result.minutes >= 60) {
			result.hours += Math.floor(result.minutes / 60);
			result.minutes = result.minutes - (Math.floor(result.minutes / 60) * 60);
		}
		if (result.hours >= 24) {
			result.days += Math.floor(result.hours / 24);
			result.hours = result.hours - (Math.floor(result.hours / 24) * 24);
		}
		if (result.days >= 30) {
			result.months += Math.floor(result.days / 30);
			result.days = result.days - (Math.floor(result.days / 30) * 30);
		}
		if (result.months >= 12) {
			result.years += Math.floor(result.months / 12);
			result.months = result.months - (Math.floor(result.months / 12) * 12);
		}
		return result;
	},
};
