// Nested query object

var Errors = require ("./Errors");

function Asker (interface, queries) {
	this.interface = interface;
	this.queries = queries;
}

Asker.prototype.inputHandler = function (query, callback, caller) {
	var $this = this;

	var handler = function (input) {
		var returnStatus = query.validate(input);

		if (query.multipleAnswer) {
			$this.handleMultipleAnswer.call ($this, input, query, returnStatus, handler, caller, callback)
		} else {
			$this.interface.write("\n");
			callback.call($this, input, returnStatus);
		}
		
	}

	return handler
}

Asker.prototype.handleMultipleAnswer = function (input, query, returnStatus, handler, caller, callback) {
	if (input == "") {
		callback.call(this, query.answers, Errors.make())
	} else {
		if (returnStatus.code == Errors.SUCCESS) {
			query.reset();
			query.answers.push(input);
		} else {
			query.increment();
			this.printError (returnStatus.msg);

			if (query.askedTooManyTimes()) {
				query.answers = [returnStatus.msg]
				handler.call (this, "");
			}
		}

		query.question = "";
		caller.call (this, query, callback);
	}
}

Asker.prototype.askSingle = function (query, callback) {
	this.interface.question(query.question, this.inputHandler(query, callback, this.askSingle));
}

Asker.prototype.askMCQ = function (query, callback) {
	var $this = this;
	var readline = require ("readline");
	var index = 0;

	this.interface.write (query.question);
	this.interface.write (query.mcq[index]);

	var onKeyPress = function (s, key) {
		if (key.name === "return") {
			process.stdin.removeListener("keypress", onKeyPress);
			($this.inputHandler.call($this, query, callback, $this.askMCQ))(query.mcq[index]);
		} else {
			readline.clearLine(process.stdout);
			readline.cursorTo(process.stdout, 0);
			if (key.name === "up") {
				index = index + 1;
			} else if (key.name === "down") {
				index = index + query.mcq.length - 1;
			}

			index %= query.mcq.length;
			$this.interface.write (query.mcq[index]);
		}

	}
	process.stdin.on ("keypress", onKeyPress);
}

// makes interface ask the question, 
// receive the reply,	
// execute callback
Asker.prototype.ask = function (query, callback) {
	if (query.isMCQ) {
		this.askMCQ (query, callback);
	} else {
		this.askSingle (query, callback);
	}
}

// Recursive call
// Controls whether to ask the question again, 
// Or ask the next question 
// when finish asking all questions,
// calls the callback
Asker.prototype.askRecursive = function (i, callback, status = Errors.make()) {
	if (i >= this.queries.length) 
		callback(status);
	else if (this.queries[i].askedTooManyTimes()) {
		console.log ("Too many tries moving on...\n");
		this.askRecursive.call (this, i + 1, callback);
	} else if (status.code != Errors.SUCCESS) {
		this.printError (status.msg);
		this.queries[i - 1].handler(status.msg);
		this.queries[i - 1].increment();
		this.queries[i - 1].setStatus(status);
		this.askRecursive.call (this, i - 1, callback, Errors.make());
	} else {
		this.queries[i].setStatus(status);
		var $this = this;
		this.ask (this.queries[i], function (value, returnStatus) {
			this.queries[i].callback(value);
			$this.askRecursive.call ($this, i + 1, callback, returnStatus);
		});
	}
}

Asker.prototype.printError = function (err) {
	console.log ("!! Error: " + err + "\n");
}

module.exports = Asker;