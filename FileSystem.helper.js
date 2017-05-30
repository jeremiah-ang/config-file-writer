var FileSystemHelper = {}

// PRE: err is either null or contains error object
// POST: returns true if either there is not error or 
//		 if error says that directory exist
FileSystemHelper.dirExist =  function (err) {
	return (!err || err.code == 'EEXIST');
}

// PRE: err is either null or contains error object
// POST: returns true if either there is not error or 
//		 if error says that file exist
FileSystemHelper.fileExist = function (err) {
	return (!err || err.code == "ENOENT");
}

// PRE: a valid file path and a callback function to be executed upon successful reading
// POST: if no error, callback will be executed, else err will be logged
FileSystemHelper.readFile = function (file, callback) {
	// node's file system
	var fs = require('fs');
	fs.readFile(file, {encoding: 'utf-8'}, function(err,data){
		if (!err) {
			// read success callback
		    callback(data);
		} else {
			// read fail
		    console.log(err);
		}
	});
}


FileSystemHelper.createAndWrite = function (filename, values, callback) {
	var fs = require('fs');
	fs.open (filename, 'w', function (err, fd) {
		if (err)
			return console.log(err);
			
		fs.writeFile (filename, values, callback);
	});
}


function ObjectToFileWriter (filename) {
	this.write = function (obj, callback, formatter = this.formatter) {
		FileSystemHelper.createAndWrite (filename, formatter(obj), callback);
	}

	this.formatter = function (config) {
		var util = require ('util');
		var resultsString = "module.exports = " 
			+ util.inspect(config, {depth: null, maxArrayLength: null}) 
				.replace ("{", "{\n ")
				.replace (/\n/g, "\n  ")
				.replace (/}$/, "\n}")
			+ "\n";
		return resultsString;
	}
}

FileSystemHelper.ObjectToFileWriter = ObjectToFileWriter

// PRE: data is a xml string
// POST: XML Object returned
FileSystemHelper.parseXML = function (data) {
	var DOMParser = require("xmldom").DOMParser;
	try {
		var doc = new DOMParser().parseFromString(data);
	} catch (e) {
		throw e;
		return;
	} finally {
		return doc;
	}
}

FileSystemHelper.removeDir = function (dir) {
	var fs = require ("fs");
	var path = require ("path");

	try {
		var files = fs.readdirSync(dir);
	} catch (e) {
		if (!FileSystemHelper.dirExist(e)) {
			console.log ("Directory doesnt exist");
		} else {
			console.log (e);
		}
	} finally {
		if (files != null) {
			files.forEach (function (file, index){
				var filename = path.join(dir, file);
				if (fs.statSync(filename).isDirectory()) {
					FileSystemHelper.removeDir(filename)
				} else {
					fs.unlinkSync(filename);
				}
			});

			fs.rmdirSync (dir);
		}
	}
}

module.exports = FileSystemHelper;