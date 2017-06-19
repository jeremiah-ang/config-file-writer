PrettyObjectPrinter.prototype.objectToString = function (obj, brackets, spacing, space='') {
	if (typeof obj != "object")
		return obj;

	var acc = "";
	var commaFlag = false;
	for (var key in obj) {
		acc += ((commaFlag) ? ",\n" : "") + space + key + ": ";
		acc += this.print (obj[key], brackets, spacing, space);
		commaFlag = true;
	}
	
	return acc;
} 

PrettyObjectPrinter.prototype.arrayToString = function (arr, brackets, spacing, space='') {
	if (!Array.isArray(arr))
		return arr;

	var acc = "";
	var commaFlag = false;
	for (var i = 0; i < arr.length; i++) {
		acc += ((commaFlag) ? ",\n" : "") + space + this.print (arr[i], brackets, spacing, space);
		commaFlag = true;
	}
	return acc;
}

PrettyObjectPrinter.prototype.wrap = function (str, open, close, space, brackets) {
	if (!brackets) return "\n" + str;
	return open + "\n" + str + "\n" + space + close;
}

PrettyObjectPrinter.prototype.indent = function (space, spacing) {
	return space + spacing
}

PrettyObjectPrinter.prototype.unindent = function (space, spacing) {
	return space.substr(spacing.length);
}

PrettyObjectPrinter.prototype.print = function (obj, brackets=true, spacing='   ', space='') {
	if (typeof obj != "object") {
		if (typeof obj == "string")
			return '"' + obj.replace(/"/g, "'") + '"';
		else return obj;
	} else if (Array.isArray(obj)) {
		return this.wrap(this.arrayToString (obj, brackets, spacing, this.indent(space, spacing)), "[", "]", space, brackets);
	} else {
		return this.wrap(this.objectToString (obj, brackets, spacing, this.indent(space, spacing)), "{", "}", space, brackets);
	}
}

function PrettyObjectPrinter () {}

module.exports = new PrettyObjectPrinter();