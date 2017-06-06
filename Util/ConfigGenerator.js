// Main Class to generate a config file

var Query = require ("./Query");
var Asker = require ("./Asker");
var Errors = require ("./Errors");
var FileSystemHelper = require ("./FileSystem.helper");

function ConfigGenerator(){};

ConfigGenerator.prototype.create = function (interface, config, file, queries) {
	var ObjectToFileWriter = FileSystemHelper.ObjectToFileWriter;
	var filewriter = new ObjectToFileWriter(file);
	var containsError = this.containsError;
	filewriter.write(config, function (err) {
		if (err) 
			return console.log (err);

		var msg = (containsError(queries)) ? "Config file created with Error" : "Config file created";
		console.log (msg + "\n");
	});
	interface.close();
}

ConfigGenerator.prototype.containsError = function (queries) {
	queries.forEach (function (query, index) {
		if(query.status != Errors.SUCCESS)
			return true;
	});
	return false;
}

// begin the process of reading input
ConfigGenerator.prototype.start = function (setup) {
	var readline = require ('readline');

	// convert each setup queries into query object
	setup.queries.forEach (function (query, index) {
		setup.queries[index] = new Query(setup.config, query);
	});

	// setup interface
	var interface = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	// ask and process the input values
	var asker = new Asker (interface, setup.queries);

	var $this = this;
	asker.askRecursive (0, function () {
		$this.create (interface, setup.config, setup.file, setup.queries)
	})
}

module.exports = new ConfigGenerator();