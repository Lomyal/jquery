define([
	"./class2type"
], function( class2type ) {
	return class2type.toString;  // @ toString 就是 ({}).toString 或 (new Object()).toString
});
