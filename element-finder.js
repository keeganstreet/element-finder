#!/usr/bin/env node

(function () {

	'use strict';

	var program = require('commander'),
		jsdom = require('jsdom'),
		ProgressBar = require('progress'),
		progressBar,
		fs = require('fs'),
		sizzle = fs.readFileSync(__dirname + '/lib/sizzle.js').toString(),
		list = function (val) {
			return val.split(',');
		},
		directory = process.cwd(),
		pluralise,
		walk,
		begin;

	// Initialise CLI
	program
		.version('0.0.1')
		.option('-s, --selector <string>', 'search for this Sizzle selector')
		.option('-x, --extension <csv list>', 'only search files with this extension (default html)', list, ['html'])
		.option('-i, --ignore <csv list>', 'ignore files matching this pattern (default .git, .svn)', list, ['.git', '.svn'])
		.parse(process.argv);

	// Show the help if no arguments were provided
	if (!process.argv.length) {
		program.help();
		return;
	}

	if (!program.selector) {
		console.log('The --selector argument is required. What Sizzle selector do you want to search for?');
		return;
	}

	pluralise = function(number, singular, plural) {
		return number.toString() + ' ' + (number === 1 ? singular : plural);
	};

	/*
	 * Recursively loop over a directory and return an array of files
	 * Only return files with an extension matching the options.extension parameter
	 * Ignore files and directories matching the options.ignore parameter
	 * The callback gets two arguments (err, files)
	 */
	walk = function (dir, callback, options) {
		var results = [];
		fs.readdir(dir, function (err, files) {
			if (err) {
				return callback(err);
			}
			var pending = files.length;
			if (pending === 0) {
				return callback(null, results);
			}

			files.forEach(function (file) {
				var path = dir + '/' + file;
				fs.stat(path, function (err, stats) {
					var i, len, extension, extensionFound = false, ignore = false;
					if (err) {
						return callback(err);
					}

					// Filter out files and directories which match the ignore argument
					for (i = 0, len = options.ignore.length; i < len; i += 1) {
						if (file === options.ignore[i]) {
							ignore = true;
						}
					}

					if (stats.isDirectory()) {
						if (ignore === false) {
							walk(path, function (err, files) {
								results = results.concat(files);
								pending -= 1;
								if (pending === 0) {
									callback(null, results);
								}
							}, options);
						} else {
							pending -= 1;
							if (pending === 0) {
								callback(null, results);
							}
						}
					} else if (stats.isFile()) {

						if (ignore === false) {
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
								results.push(path);
							}
						}

						pending -= 1;
						if (pending === 0) {
							callback(null, results);
						}
					}
				});
			});
		});
	};

	begin = function () {
		var numberOfFiles,
			numberOfFilesWithMatches = 0,
			processFile;

		processFile = function(i, filePath) {
			var data = fs.readFileSync(filePath, 'utf8');
			jsdom.env({
				html: data,
				src: [sizzle],
				done: function (errors, window) {
					var matches = window.Sizzle(program.selector),
						matchesLen = matches.length;
					if (matchesLen > 0) {
						numberOfFilesWithMatches += 1;
						console.log('Found ' + pluralise(matchesLen, 'match', 'matches') + ' in ' + filePath);
					}
				}
			});
			progressBar.tick();
			if (i === numberOfFiles - 1) {
				console.log('\n');
			}
		};

		walk(directory, function (err, files) {
			var i;
			if (err) {
				throw err;
			}
			numberOfFiles = files.length;
			console.log('Searching for "' + program.selector + '" in ' + pluralise(numberOfFiles, 'file', 'files') + ' in "' + directory + '".');
			progressBar = new ProgressBar('[:bar] :percent :etas', {total: numberOfFiles, width: 20});
			for (i = 0; i < numberOfFiles; i += 1) {
				processFile(i, files[i]);
			}
		}, {
			extension: program.extension,
			ignore: program.ignore
		});
	};

	begin();

}());

