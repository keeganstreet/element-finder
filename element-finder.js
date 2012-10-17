#!/usr/bin/env node

/*globals require, __dirname, process, console */

(function () {

	'use strict';

	var startTime = Date.now(),
		fs = require('fs'),
		jsdom = require('jsdom'),
		program = require('commander'),
		ProgressBar = require('progress'),
		sizzle = fs.readFileSync(__dirname + '/lib/sizzle.js').toString(),
		list = function (val) {
			var arr = val.split(','),
				i, len;
			for (i = 0, len = arr.length; i < len; i += 1) {
				arr[i] = arr[i].trim();
			}
			return arr;
		},
		stripQuotes = function (val) {
			var c1 = val.substr(0, 1),
				c2 = val.substr(-1);
			if ((c1 === '"' && c2 === '"') || (c1 === "'" && c2 === "'")) {
				return val.substr(1, val.length - 2);
			}
			return val;
		},
		pluralise = function (number, singular, plural) {
			return number.toString() + ' ' + (number === 1 ? singular : plural);
		},
		output,
		walk,
		begin;

	// Initialise CLI
	program
		.version('0.1.2')
		.option('-s, --selector <string>', 'search for this Sizzle selector', stripQuotes)
		.option('-x, --extension <csv list>', 'only search files with this extension (default html, htm, shtml)', list, ['html', 'htm', 'shtml'])
		.option('-i, --ignore <csv list>', 'ignore files matching this pattern (default .git, .svn)', list, ['.git', '.svn'])
		.option('-j, --json', 'output each line as JSON (useful for reading the output in another app)')
		.option('-d, --directory <string>', 'the directory to search (defaults to current working directory)', stripQuotes, process.cwd())
		.parse(process.argv);

	// Show the help if no arguments were provided
	if (!process.argv.length) {
		program.help();
		return;
	}

	// Print output in human readable format or JSON, depending on the ouput settings
	output = function(info) {
		if (program.json) {
			console.log(JSON.stringify(info));
		} else if (info.message) {
			console.log(info.message);
		}
	};

	if (!program.selector) {
		output({
			'status' : 'error',
			'message' : 'The --selector argument is required. What Sizzle selector do you want to search for?'
		});
		return;
	}

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
			totalMatches = 0,
			processFile,
			progressBar,
			trimLines;

		// Returns the first x lines of a string
		trimLines = function(input, x) {
			var endIndex = 0,
				nextIndex;
			while ((nextIndex = input.indexOf('\n', endIndex + 1)) > -1 && x > 0) {
				x -= 1;
				endIndex = nextIndex;
			}
			if (x > 0) {
				// Less than x lines where found, so return the entire string
				return input;
			}
			return input.substring(0, endIndex);
		};

		processFile = function (i, filePath) {
			var data = fs.readFileSync(filePath, 'utf8');
			jsdom.env({
				html: data,
				src: [sizzle],
				done: function (errors, window) {
					var matches = window.Sizzle(program.selector),
						matchesLen = matches.length,
						matchesDetails = [],
						matchI;
					if (matchesLen > 0) {
						numberOfFilesWithMatches += 1;
						totalMatches += matchesLen;
						for (matchI = 0; matchI < matchesLen; matchI += 1) {
							matchesDetails.push(trimLines(matches[matchI].outerHTML, 2));
						}
						output({
							'status' : 'foundMatch',
							'file' : filePath,
							'matches' : matchesLen,
							'matchesDetails' : matchesDetails,
							'message' : 'Found ' + pluralise(matchesLen, 'match', 'matches') + ' in ' + filePath
						});
					}
					if (i === numberOfFiles - 1) {
						output({
							'status' : 'complete',
							'totalMatches' : totalMatches,
							'numberOfFiles' : numberOfFiles,
							'numberOfFilesWithMatches' : numberOfFilesWithMatches,
							'duration' : (Date.now() - startTime) / 1000,
							'message' : '\nFound ' + pluralise(totalMatches, 'match', 'matches') + ' in ' + pluralise(numberOfFilesWithMatches, 'file', 'files') + '.'
						});
					}
				}
			});
			if (program.json) {
				output({
					'status' : 'processingFile',
					'file' : filePath,
					'fileNumber' : i + 1,
					'numberOfFiles' : numberOfFiles
				});
			} else {
				progressBar.tick();
				if (i === numberOfFiles - 1) {
					output({'message' : '\n'});
				}
			}
		};

		walk(program.directory, function (err, files) {
			var i;
			if (err) {
				throw err;
			}
			numberOfFiles = files.length;
			output({
				'status' : 'countedFiles',
				'selector' : program.selector,
				'directory' : program.directory,
				'extension' : program.extension.join(', '),
				'ignore' : program.ignore.join(', '),
				'numberOfFiles' : numberOfFiles,
				'message' : 'Searching for "' + program.selector + '" in ' + pluralise(numberOfFiles, 'file', 'files') + ' in "' + program.directory + '".'
			});
			if (!program.json) {
				progressBar = new ProgressBar('[:bar] :percent :elapseds', {total: numberOfFiles, width: 20});
			}
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
