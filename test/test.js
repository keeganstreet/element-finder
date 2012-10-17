var CLIeasy = require('cli-easy'),
	assert = require('assert');

	CLIeasy.describe('element-finder')
		.use('node element-finder.js')
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

		.arg('-d test/example-html')

			.discuss('searching for an element')
				.arg('-s "li"')
				.expect('should find 12 matches in 4 files', /Found 12 matches in 4 files.\s*$/)
			.undiscuss()

			.discuss('searching html files only')
				.arg('-s "li" -x "html"')
				.expect('should find 9 matches in 3 files', /Found 9 matches in 3 files.\s*$/)
			.undiscuss()

			.discuss('search while ignoring the subfolder')
				.arg('-s "li" -i "subfolder"')
				.expect('should find 6 matches in 2 files', /Found 6 matches in 2 files.\s*$/)
			.undiscuss()

			.discuss('search for a more complex selector')
				.arg('-s ".colours > .awesome-list *:first-child"')
				.expect('should find 1 match in 1 file', /Found 1 match in 1 file.\s*$/)
			.undiscuss()

			.discuss('search with negation pseudo-selector')
				.arg('-s "div:not(.colours)"')
				.expect('should find 3 matches in 3 files', /Found 3 matches in 3 files.\s*$/)
			.undiscuss()

			.discuss('testing the dom structure')
				.arg('-s "html > body > div.colours > ul.awesome-list > li"')
				.expect('should find 3 matches in 1 file', /Found 3 matches in 1 file.\s*$/)
			.undiscuss()

		.export(module);
