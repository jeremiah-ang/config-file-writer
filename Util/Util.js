/*
MISC. FUNCTIONS
*/
// PRE: keys is an array where each element is the key to the next level
// 		i.e. ['a', 1, 'b'] -> obj['a'][1]['b']
// POST: the value of the given key is retured
module.exports.getValueByKeys = function (obj, keys) {
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
module.exports.setValueByKeys = function (obj, keys, newValue) {
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