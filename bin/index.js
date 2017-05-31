#!/usr/bin/env node

var ConfigGeneratorHelper = require("../Util/ConfigGenerator.helper");
var readInput = ConfigGeneratorHelper.readInput;
var setup = {

	config: {projectTitle:"Default Title"},

	queries: [
		{
			question: "Project Title",
			key: ['projectTitle']
		},
		{
			question: "Favourite Fruit",
			key: ['favs', 'fruit']
		},
		{
			question: "Favourite Color",
			key: ['favs', 'color']
		}
	],

	file: "project.config.js"
}

readInput(setup);