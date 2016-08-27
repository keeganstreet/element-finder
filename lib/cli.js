module.exports = function(process) {
	var program = require('commander'),
		elfinder = require('./element-finder.js'),
		list = function(val) {
			var arr = val.split(','),
				i, len;
			for (i = 0, len = arr.length; i < len; i += 1) {
				arr[i] = arr[i].trim();
			}
			return arr;
		},
		stripQuotes = function(val) {
			var c1 = val.substr(0, 1),
				c2 = val.substr(-1);
			if ((c1 === '"' && c2 === '"') || (c1 === "'" && c2 === "'")) {
				return val.substr(1, val.length - 2);
			}
			return val;
		},
		output;

	// Initialise CLI
	program
		.version('0.2.0')
		.option('-s, --selector <string>', 'search for this CSS selector', stripQuotes)
		.option('-x, --extension <csv list>', 'only search files with this extension (default html, htm, shtml)', list, ['html', 'htm', 'shtml'])
		.option('-i, --ignore <csv list>', 'ignore files matching this pattern (default .git, .svn)', list, ['.git', '.svn'])
		.option('-j, --json', 'output each line as JSON (useful for reading the output in another app)')
		.option('-d, --directory <string>', 'the directory to search (defaults to current working directory)', stripQuotes, process.cwd())
		.option('-f, --files <csv list>', 'files to search through (if this is provided then extension, ignore and directory are ignored)', list)
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
			'status': 'error',
			'message': 'The --selector argument is required. What CSS selector do you want to search for?'
		});
		return;
	}

	if (program.files) {
		delete program.extension;
		delete program.ignore;
		delete program.directory;
	}

	elfinder({
		selector: program.selector,
		extension: program.extension,
		ignore: program.ignore,
		directory: program.directory,
		files: program.files
	}, output);
};
