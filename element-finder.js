#!/usr/bin/env node

(function () {

	var program = require('commander'),
			list = function (val) {
				return val.split(',');
			};

	program
		.version('0.0.1')
		.option('-p, --path', 'search in this directory')
		.option('-s, --selector', 'search for this Sizzle selector')
		.option('-x, --extension <items>', 'only search files with this extension (default html)', list)
		.parse(process.argv);

	// Show the help if no arguments were provided
	if (!process.argv.length) {
		program.help();
		return;
	}

}());

