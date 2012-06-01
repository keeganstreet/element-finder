#!/usr/bin/env node

(function () {

	'use strict';

	var program = require('commander'),
		jsdom = require('jsdom'),
		fs = require('fs'),
		sizzle = fs.readFileSync('./lib/sizzle.js').toString(),
		list = function (val) {
			return val.split(',');
		},
		walk = function (dir, success, error) {
			fs.readdir(dir, function (err, list) {
				if (err) {
					return error(err);
				}
				list.forEach(function (file) {
					file = dir + '/' + file;
					fs.stat(file, function (err, stat) {
						if (err) {
							return error(err);
						}
						if (stat && stat.isDirectory()) {
							walk(file, success, error);
						} else {
							success(file);
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

	walk(program.path, function (filePath) {
		fs.readFile(filePath, 'utf8', function (err, data) {
			if (err) {
				throw err;
			}
			jsdom.env({
				html: data,
				src: [sizzle],
				done: function (errors, window) {
					var matches = window.Sizzle(program.selector),
						matchesLen = matches.length;
					if (matchesLen > 0) {
						console.log('Found ' + matchesLen + (matchesLen > 1 ? ' matches' : ' match') + ' in ' + filePath);
					}
				}
			});
		});
	}, function (err) {
		throw err;
	});

}());

