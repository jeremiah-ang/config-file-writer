// Query Object 
var Errors = require ("./Errors");
var Utils = require ("./Util");

function Query (config, obj) {

	this.key = obj.key;
	this.precondition = obj.precondition;
	this.validator = obj.validator;
	this.multipleAnswer = obj.multipleAnswer;
	this.skipOnEmpty = (obj.allowEmpty || this.multipleAnswer) || true;
	this.default = this.initDefault (config, obj);
	this.handler = this.initHandler (config, obj);
	this.question = this.initQuestion (config, obj);

	this.answers = [];
	this.attempts = 0;
	this.status = Errors.make();

	this.mcq = obj.mcq;
	this.isMCQ = Array.isArray(this.mcq) && this.mcq.length > 1;
	if (this.isMCQ) { this.mcq.push(""); }

	this.callback = this.initCallback ();
}

Query.prototype.increment = function () {
	this.attempts += 1;
}
Query.prototype.reset = function () {
	this.attempts = 0;
}
Query.prototype.askedTooManyTimes = function () {
	return this.attempts > 2;
}
Query.prototype.setStatus = function (status) {
	this.status = status
}
Query.prototype.validate = function (msg) {
	return Errors.make(msg, this.skipOnEmpty, this.validator);
}

Query.prototype.hasDefault = function () {
	return !(this.default == null ||
		typeof this.default != 'string' ||
		this.default.length == 0)
}

Query.prototype.initQuestion = function (config, obj) {

	var question = ">> ";
	question += (this.hasDefault()) ? obj.question + "(" + this.default + ")" : obj.question;
	question += (this.multipleAnswer) ? "(Blank to proceed)" : "";
	question += ":\n";
	return question;
}

Query.prototype.initCallback = function () {
	var $this = this;	
	return function (msg) {
		$this.handler(msg)
	}
}

Query.prototype.initDefault = function (config, obj) {
	if (obj.default == null && obj.key != null) {
		// get the default value in the config object
		var getter = Utils.getValueByKeys;
		return getter(config, obj.key);
	} else {
		return obj.default;
	}
}

Query.prototype.initHandler = function (config, obj) {
	var setter = Utils.setValueByKeys;
	var hasDefault = this.hasDefault();

	if (obj.handler == null) {
		if (obj.key == null) {
			return function (msg) {};
		}
		return function (msg) { 
			msg = ((msg == null || msg.length == 0) && hasDefault) ? obj.default : msg;
			setter(config, obj.key, msg); 
		}
	} else {
		if (obj.key != null) {
			return function (msg) {
				setter(config, obj.key, obj.handler(msg));
			}
		}
	}

	return obj.handler;
}

module.exports = Query;