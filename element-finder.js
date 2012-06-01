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
		walk = function (dir, options) {
			//console.log('Walking ' + dir);
			fs.readdir(dir, function (err, files) {
				if (err) {
					return options.error(err);
				}
				files.forEach(function (file) {
					var path = dir + '/' + file;
					//console.log('File: ' + file);
					fs.stat(path, function (err, stats) {
						var i, len, extension, extensionFound = false;
						if (err) {
							return options.error(err);
						}
						// Filter out files and directories which match the ignore argument
						for (i = 0, len = options.ignore.length; i < len; i += 1) {
							if (file === options.ignore[i]) {
								return;
							}
						}
						if (stats.isDirectory()) {
							walk(path, options);
						} else if (stats.isFile()) {
							// Filter out files whose extension does not match the extension argument
							len = options.extension.length;
							if (len === 0) {
								extensionFound = true;
							} else {
								extension = file.substring(file.lastIndexOf('.') + 1);
								for (i = 0; i < len; i += 1) {
									if (extension === options.extension[i]) {
										extensionFound = true;
										break;
									}
								}
							}
							if (extensionFound) {
								options.success(path);
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
		.option('-i, --ignore <csv list>', 'ignore files matching this pattern (default .git, .svn)', list, ['.git', '.svn'])
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

	walk(program.path, {
		extension: program.extension,
		ignore: program.ignore,
		success: function (filePath) {
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
		},
		error: function (err) {
			throw err;
		}
	});

}());

