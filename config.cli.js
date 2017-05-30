var ConfigGeneratorHelper = require("./ConfigGenerator.helper");
var readInput = ConfigGeneratorHelper.readInput;
var setup = {

	config: {},

	queries: [
		{
			question: "Project Title",
			key: ['projectTitle']
		},
		{
			question: "Rocketchat Channel",
			key: ['jenkins', 'rocketchatChannel']
		},
		{
			question: "Email",
			key: ['jenkins', 'email']
		},
		{
			question: "Project Git repo",
			handler: ConfigGeneratorHelper.gitConfigHandler
		}
	],

	file: "project.config.js"
}

readInput(setup);