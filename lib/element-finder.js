module.exports = function(options, progressCallback) {
	var startTime = Date.now(),
		fs = require('fs'),
		domtosource = require('domtosource'),
		pluralise = function(number, singular, plural) {
			return number.toString() + ' ' + (number === 1 ? singular: plural);
		},
		walk,
		begin;

	/*
	 * Recursively loop over a directory and return an array of files
	 * Only return files with an extension matching the options.extension parameter
	 * Ignore files and directories matching the options.ignore parameter
	 * The callback gets two arguments (err, files)
	 */
	walk = function(dir, callback, options) {
		var results = [];
		fs.readdir(dir, function(err, files) {
			if (err) {
				return callback(err);
			}
			var pending = files.length;
			if (pending === 0) {
				return callback(null, results);
			}

			files.forEach(function(file) {
				var path = dir + '/' + file;
				fs.stat(path, function(err, stats) {
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
							walk(path, function(err, files) {
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

	begin = function() {
		var numberOfFiles,
			numberOfFilesWithMatches = 0,
			totalMatches = 0,
			processFile,
			processFiles,
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

		processFile = function(fileIndex, filePath) {
			progressCallback({
				'status': 'processingFile',
				'file': filePath,
				'fileNumber': fileIndex + 1,
				'numberOfFiles': numberOfFiles
			});

			var data = fs.readFileSync(filePath, 'utf8'),
				matches = [],
				matchesLen,
				matchesDetails = [],
				i,
				duration;

			if (data && options.selector) {
				matches = domtosource.find(data, options.selector);
			}
			matchesLen = matches.length;

			if (matchesLen > 0) {
				numberOfFilesWithMatches += 1;
				totalMatches += matchesLen;
				for (i = 0; i < matchesLen; i += 1) {
					matchesDetails.push({
						'html': trimLines(matches[i].html, 2),
						'line': matches[i].line,
						'column': matches[i].column
					});
				}
				progressCallback({
					'status': 'foundMatch',
					'file': filePath,
					'matches': matchesLen,
					'matchesDetails': matchesDetails,
					'message': 'Found ' + pluralise(matchesLen, 'match', 'matches') + ' in ' + filePath
				});
			}

			if (fileIndex === numberOfFiles - 1) {
				duration = (Date.now() - startTime) / 1000;
				progressCallback({
					'status': 'complete',
					'totalMatches': totalMatches,
					'numberOfFiles': numberOfFiles,
					'numberOfFilesWithMatches': numberOfFilesWithMatches,
					'duration': duration,
					'selector': options.selector,
					'message': '\nFound ' + pluralise(totalMatches, 'match', 'matches') + ' in ' + pluralise(numberOfFilesWithMatches, 'file', 'files') + ' (' + duration + ' seconds).'
				});
			}
		};

		processFiles = function(err, files) {
			var i;
			if (err) {
				throw err;
			}
			numberOfFiles = files.length;
			progressCallback({
				'status': 'countedFiles',
				'selector': options.selector,
				'directory': options.directory,
				'extension': (options.extension ? options.extension.join(', ') : null),
				'ignore': (options.ignore ? options.ignore.join(', ') : null),
				'files': (options.files ? options.files.join(', ') : null),
				'numberOfFiles': numberOfFiles,
				'message': 'Searching for "' + options.selector + '" in ' + pluralise(numberOfFiles, 'file', 'files') + (options.directory ? ' in "' + options.directory + '"' : '') + '.'
			});
			for (i = 0; i < numberOfFiles; i += 1) {
				processFile(i, files[i]);
			}
			if (totalMatches === 0) {
				duration = (Date.now() - startTime) / 1000;
				progressCallback({
					'status': 'complete',
					'totalMatches': totalMatches,
					'numberOfFiles': numberOfFiles,
					'numberOfFilesWithMatches': numberOfFilesWithMatches,
					'duration': duration,
					'selector': options.selector,
					'message': '\nNo results found (' + duration + ' seconds).'
				});
			}
		};

		if (options.files) {
			processFiles(null, options.files);
		} else {
			walk(options.directory, processFiles, {
				extension: options.extension,
				ignore: options.ignore
			});
		}
	}

	begin();
};
