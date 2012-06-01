#!/usr/bin/env node

"use strict";

(function () {

	var program = require('commander'),
		fs = require('fs'),
		list = function (val) {
			return val.split(',');
		},
		walk = function (dir, done) {
			var results = [];
			fs.readdir(dir, function (err, list) {
				var pending;
				if (err) {
					return done(err);
				}
				pending = list.length;
				if (pending === 0) {
					return done(null, results);
				}
				list.forEach(function (file) {
					file = dir + '/' + file;
					fs.stat(file, function (err, stat) {
						if (stat && stat.isDirectory()) {
							walk(file, function (err, res) {
								results = results.concat(res);
								pending -= 1;
								if (pending === 0) {
									done(null, results);
								}
							});
						} else {
							results.push(file);
							pending -= 1;
							if (pending === 0) {
								done(null, results);
							}
						}
					});
				});
			});
		};

	program
		.version('0.0.1')
		.option('-p, --path <string>', 'search in this directory')
		.option('-s, --selector <string>', 'search for this Sizzle selector')
		.option('-x, --extension <csv list>', 'only search files with this extension (default html)', list, ['html'])
		.parse(process.argv);

	// Show the help if no arguments were provided
	if (!process.argv.length) {
		program.help();
		return;
	}

	if (!program.path) {
		console.log('The --path argument is required. Which directory do you want to search in?');
		return;
	}

	if (!program.selector) {
		console.log('The --selector argument is required. What Sizzle selector do you want to search for?');
		return;
	}

	//console.log('Loop through "' + program.path + '" and look for selector "' + program.selector + '" in file extension "' + program.extension + '"');

	walk(program.path, function (err, results) {
		if (err) {
			throw err;
		}
		console.log(results);
	});

}());

