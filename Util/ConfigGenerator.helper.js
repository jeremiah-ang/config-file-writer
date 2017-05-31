var FileSystemHelper = require ("./FileSystem.helper");
var ConfigGenerator = {};

// PRE: Error code provided
// POST: returns Error messages based on error code
ConfigGenerator.getErrorString = function (err) {
	switch (err) {
		case 1: return "SUCCESS";
		case 2: return "Value cannot be empty";
		case 3: return "Invalid input type: ";
		default: return "Unknown Error"
	}
}

// PRE: 
// POST: status is generated, code value hard coded. 
ConfigGenerator.makeStatus = function (msg = '', skipOnEmpty = true, validator = null) {
	var code = 1, errMsg = '';
	if (!skipOnEmpty && msg.length == 0) {
		code = 2;
	} else if (validator != null) {
		errMsg = validator(msg);
		if (errMsg != null)
			code = 3;
		else errMsg = '';
	} 

	return { code: code, msg: ConfigGenerator.getErrorString(code) + errMsg};
}

// Creates a stream of queries 
ConfigGenerator.createNestedQuery = function (interface, queries) {

	// makes interface ask the question, 
	// receive the reply,
	// execute callback
	function question (msg, callback) {
		interface.question(">> " + msg + "\n", function (input) {
			interface.write ("\n");
			callback(input.trim());
		});
	}

	// Stream
	// Controls whether to ask the question again, 
	// Or ask the next question 
	// when finish asking all questions,
	// calls the callback
	function nestedQuery (i, callback, status = ConfigGenerator.makeStatus(), tries = 0) {
		if (i >= queries.length) 
			callback(status);
		else if (tries > 2) {
			console.log ("Too many tries moving on...\n");
			nestedQuery (i + 1, callback);
		} else if (status.code > 1) {
			console.log ("!! Error: " + status.msg + "\n");
			nestedQuery (i - 1, callback, ConfigGenerator.makeStatus(), tries + 1);
		} else {
			question (queries[i].question, function (msg) {
				var returnStatus = queries[i].callback(msg);
				nestedQuery (i + 1, callback, returnStatus, tries);
			});
		}
	}
	return nestedQuery;
}

// Create a query object based on the config.queries object
ConfigGenerator.makeQuery = function (config, obj) {

	if (obj.default == null && obj.key != null) {
		var getter = ConfigGenerator.getValueByKeys;
		obj.default = getter(config, obj.key);
	}

	if (obj.handler == null) {
		if (obj.key == null) {
			console.log ("Either Handler or Key must be not null");
			return;
		}
		var setter = ConfigGenerator.setValueByKeys;
		obj.handler = function (msg) { 
			msg = (msg.length == 0 && obj.default.length > 0) ? obj.default : msg;
			setter(config, obj.key, msg); 
		}
	}

	return ConfigGenerator.query (obj.question,obj.handler, obj.default, obj.skipOnEmpty, obj.validator);
}

// returns an object with attributes of Query object
// Should make it prototype
ConfigGenerator.query = function (question, callback, defaultValue = "", skipOnEmpty = true, validator = null) {
	var obj = {
		question: ((defaultValue.length > 0) ? question + "(" + defaultValue + ")" : question) + ":",
		callback: function (msg) { 
			var status = ConfigGenerator.makeStatus(msg, skipOnEmpty, validator);
			if (status.code > 1)
				return status;

			callback(msg);
			return status;
		},
		validator: validator
	}
	return obj;
}


// receives the config object and write into the file specified in the file variable
ConfigGenerator.createProjectConfig = function (interface, config, status, file) {
	var ObjectToFileWriter = FileSystemHelper.ObjectToFileWriter;
	var filewriter = new ObjectToFileWriter(file);
	filewriter.write(config, function (err) {
		if (err) 
			return console.log (err);

		var msg = (status.code > 1) ? "Config file created with Error" : "Config file created";
		console.log (msg + "\n");
	});
	interface.close();
}

// begin the process of reading input
ConfigGenerator.readInput = function (setup) {
	var readline = require ('readline');

	// convert each setup queries into query object
	setup.queries.forEach (function (query, index) {
		setup.queries[index] = ConfigGenerator.makeQuery(setup.config, query);
	});

	// setup interface
	var interface = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	// ask and process the input values
	ConfigGenerator.createNestedQuery (interface, setup.queries) (0, function (status) {
		ConfigGenerator.createProjectConfig(interface, setup.config, status, setup.file);
	});
}

/*
MISC. FUNCTIONS
*/
// PRE: keys is an array where each element is the key to the next level
// 		i.e. ['a', 1, 'b'] -> obj['a'][1]['b']
// POST: the value of the given key is retured
ConfigGenerator.getValueByKeys = function (obj, keys) {
	var value = obj;
	keys.forEach(function(key, index){
		if (value[key] == null) {
			return value[key];
		}  
		value = value[key];
	});
	return value;
}

// PRE: keys is an array where each element is the key to the next level
// 		i.e. ['a', 1, 'b'] -> obj['a'][1]['b']
// POST: the value of the given key is retured set to the new value
ConfigGenerator.setValueByKeys = function (obj, keys, newValue) {
	var value = obj;
	keys.forEach(function(key, index){
		if (value[key] == null) {
			value[key] = {}
		}  
		if (index == keys.length - 1) {
			value[key] = newValue
			return;
		}
		value = value[key];
	});
}


module.exports = ConfigGenerator;