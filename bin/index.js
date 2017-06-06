#!/usr/bin/env node

var ConfigGenerator = require("../Util/ConfigGenerator");
var setup = {

	config: {projectTitle:"Default Title"},

	queries: [
		{
			question: "Project Title",
			key: ['projectTitle'], // optional
			handler: function (msg) { // optional
				console.log(msg);
				// if Key is defined returned msg will be stored in the key
				// well... you could do it yourself also. 
				// if multipleAnswer, msg is an array
				return msg
			},
			precondition: function () { // optional
				// if return true, this question will be asked 
				if (setup.config.projectTitle == "Default Title")
					return true;
				return false;
			},
			validator: function (msg, success) { // optional
				if (true) {
					// if its a valid message, return the success object
					return success
				}
				return "Error Msg";
			},
			allowEmpty: true,
			default: "Hello world"
		},
		{
			question: "Favourite Fruit",
			key: ['favs', 'fruit'],
			mcq: ['apple', 'orange', 'pear'],
			validator: function (msg, success) {
				if (msg == 1) {
					return "CANNOT BE 1";
				} else return success;
			},
			multipleAnswer:true,
		},
		{
			question: "Favourite Color",
			key: ['favs', 'color']
		}
	],

	file: "project.config.js"
}

ConfigGenerator.start(setup);