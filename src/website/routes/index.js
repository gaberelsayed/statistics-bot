const { Router } = require('express'),
	fetch = require('node-fetch'),
	{ domain } = require('../../config.js'),
	router = Router();

module.exports = () => {

	router.get('/', async (req, res) => {
		// render page
		const data = await fetch(`${domain}api`).then(r => r.json());

		res.render('index', data);
	});

	return router;
};
