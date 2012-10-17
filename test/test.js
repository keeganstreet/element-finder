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

			.discuss('calling with -s "li"')
				.arg('-s "li"')
				.expect('should return 9 matches in 3 files', /Found 9 matches in 3 files.\s*$/)
			.undiscuss()

		.export(module);
