var CLIeasy = require('cli-easy'),
	assert = require('assert');

	CLIeasy.describe('element-finder')
		.use('node bin/element-finder.js')
		.discuss('when using elfinder')
		.undiscuss()

		.discuss('calling without any arguments')
			.arg()
			.expect('should return error message', /^The --selector argument is required./)
		.undiscuss()

		.discuss('calling with -h')
			.arg('-h')
			.expect('should return help message', /^\s*Usage/)
		.undiscuss()

		.discuss('calling with -V')
			.arg('-V')
			.expect('should return version number', /^\d\.\d\.\d/)
		.undiscuss()

		.discuss('searching an empty file')
			.arg('-s "li"')
			.arg('-f test/example-html/empty.html')
			.expect('should find 0 matches in 0 files', /Found 0 matches in 0 files./)
		.undiscuss()

		.arg('-d test/example-html')

			.discuss('searching for an element')
				.arg('-s "li"')
				.expect('should find 14 matches in 4 files', /Found 14 matches in 4 files./)
			.undiscuss()

			.discuss('searching html files only')
				.arg('-s "li" -x "html"')
				.expect('should find 11 matches in 3 files', /Found 11 matches in 3 files./)
			.undiscuss()

			.discuss('search while ignoring the subfolder')
				.arg('-s "li" -i "subfolder"')
				.expect('should find 8 matches in 2 files', /Found 8 matches in 2 files./)
			.undiscuss()

			.discuss('search for a more complex selector')
				.arg('-s ".colours > .awesome-list *:first-child"')
				.expect('should find 2 matches in 1 file', /Found 2 matches in 1 file./)
			.undiscuss()

			.discuss('search with negation pseudo-selector')
				.arg('-s "div:not(.colours)"')
				.expect('should find 3 matches in 3 files', /Found 3 matches in 3 files./)
			.undiscuss()

			.discuss('testing the dom structure')
				.arg('-s "html > body > div.colours > ul.awesome-list > li"')
				.expect('should find 3 matches in 1 file', /Found 3 matches in 1 file./)
			.undiscuss()

			.discuss('testing elements inside elements')
				.arg('-s ".green"')
				.expect('should find 4 matches in 1 file', /Found 4 matches in 1 file./)
			.undiscuss()

			.discuss('testing a very large HTML page')
				.arg('-x "largepage" -s "p"')
				.expect('should find 333 matches in 1 file', /Found 333 matches in 1 file./)
			.undiscuss()

			.discuss('searching via files parameter')
				.arg('-s "li" -f "test/example-html/page1.html, test/example-html/page2.html, test/example-html/subfolder/page4.htm"')
				.expect('should find 11 matches in 3 files', /Found 11 matches in 3 files./)
			.undiscuss()

			.discuss('testing input that returns zero results')
				.arg('-s ".made-up-classname-that-is-not-used"')
				.expect('should find zero results', /No results found/)
			.undiscuss()

		.export(module);
