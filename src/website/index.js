// dependecies
const express = require('express'),
	app = express();

module.exports = (bot) => {
	app
		.engine('html', require('ejs').renderFile)
		.set('view engine', 'ejs')
		.set('views', './src/website/views')
		.use(express.static('./src/website/public'))
		.use('/', require('./routes')(bot));

	app.listen(3500, () => {
		console.log('Example app listening on port 3500');
	});
};
