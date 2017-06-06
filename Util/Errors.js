function Errors (code, msg) {
	this.code = code;
	this.msg = msg;
}

Errors.SUCCESS = 200;
Errors.NO_NULL = 2;
Errors.INVALID_INPUT = 3;

Errors.make = function (msg = '', skipOnEmpty = true, validator = null) {
	var code = Errors.SUCCESS, errMsg = '';

	if (!skipOnEmpty && msg.length == 0) {
		code = Errors.NO_NULL;
	} else if (validator != null) {
		errMsg = validator(msg, Errors.SUCCES);
		if (errMsg != Errors.SUCCES)
			code = Errors.INVALID_INPUT;
		else errMsg = '';
	} 

	return new Errors (code, this.toString(code) + errMsg);
}

Errors.toString = function (err) {
	switch (err) {
		case Errors.SUCCESS: return "SUCCESS";
		case Errors.NO_NULL: return "Value cannot be empty";
		case Errors.INVALID_INPUT: return "Invalid input type: ";
		default: return "Unknown Error"
	}
}

module.exports = Errors;