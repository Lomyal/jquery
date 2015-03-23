define([
	"./var/arr",
	"./var/document",
	"./var/slice",
	"./var/concat",
	"./var/push",
	"./var/indexOf",
	"./var/class2type",
	"./var/toString",
	"./var/hasOwn",
	"./var/support"
], function( arr, document, slice, concat, push, indexOf, class2type, toString, hasOwn, support ) {

var
	version = "@VERSION",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );  // @ 虽然加载 core 模块时尚未加载 core/init 模块，但在 core 中，此行只是定义，不是执行，所以对 core/init 没有依赖关系。
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,  // @ 因为给 jQuery.prototype 赋了新值，所以需要重建原型中指向构造函数的 constructor 属性

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );  // @ slice 即 ([]).slice() 或 Array.prototype.slice()，可以将“类数组”转换为“数组”
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,  // @ i 表示第一个“次扩展对象”的位置，用于对齐“主扩展对象”是第二个参数、是第一个参数以及不在参数列表中这三种情况（默认“主扩展对象”是第一个参数，i 指向第二个参数）
		length = arguments.length,  // @ 对于不限定参数个数的函数的处理技巧
		deep = false;  // @ 默认是浅拷贝

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {  // @ 深拷贝（target 为 false 时，也是浅拷贝）
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;  // @ “主扩展对象”是第二个参数，i 指向第三个参数
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {  // @ 扩展为函数提供作用域的对象自身
		target = this;  // @ 这里使用了 this，那么如果调用 $.extend() 会扩展 jQuery 构造函数对象（静态方法），如果调用 $.fn.extend() 会扩展 jQuery 原型对象（原型方法），如果调用$(XXX).extend() 则会扩展 jQuery 实例对象（实例方法）。
		i--;  // @ “主扩展对象”不在参数列表中，i 指向第一个参数
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {  // @ 注意这里使用 != （而不是 !== ）判断，当左边是 null 或 undefined 时都会返回 false
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) ||  // @ 如果深拷贝打开，且当前“次扩展对象”中的某 value 是对象或数组，则递归进入下一层复制
					(copyIsArray = jQuery.isArray(copy)) ) ) {

					if ( copyIsArray ) {  // @ 对 || 短路特性的应用，用以判断到底是第一个条件被满足还是第二个条件被满足（避免再次调用函数判断 copy 的类型）
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];  // @ 如果当前“主扩展对象”中的 value 也是数组（与“次扩展对象”中的 value 类型相同），扩展它，否则覆盖它

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};  // @ 如果当前“主扩展对象”中的 value 也是对象（与“次扩展对象”中的 value 类型相同），扩展它，否则覆盖它
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );  // @ 注意此处等号左侧若写 src 是没有期望效果的，不会改变 target

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {  // @ 浅拷贝，或是深拷贝中“非对象非数组” value 的拷贝
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({  // @ 第一次调用 extend()，恰好（故意）不是深拷贝，所以可以趁机定义 extend() 中用到的（且尚未定义的） jQuery.isPlainObject() 和 jQuery.isArray()
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";  // @ easy
	},

	isArray: Array.isArray,  // @ 原生JS实现了 isArray，所以这里很容易

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;  // @ window 中保存了对自身的引用！（window === window.window，且注意 obj 非空的判断，可防止 obj 为空时 obj.window 报错 ）
	},

	isNumeric: function( obj ) {  // @ 判断是否是【数字】或【数字字符串】
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;  // @  parseFloat() 会解析传入数组的第一个元素，所以要先屏蔽掉 obj 是数组的这种情况
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"  // @ 注意“朴素对象”的定义，Array、Date等不是朴素对象
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}  // @ 现在还不能确定 obj 是否是 Object 的直接实例。（有可能是 Object 子类型的实例，这种情况 jQuery.type( obj ) 也会返回 "object"）

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {  // @ isPrototypeOf() 是存在于 Object.prototype 中的。检测此条可判断 obj 是 Object 的直接实例还是 Object 子类型的实例。
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {  // @ 若为空对象，则此循环内语句一次都不会执行
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) { // @ 若 obj 是 undefined 或 null
			return obj + "";  // @ 则将其转换成字符串后输出
		}
		// Support: Android<4.0 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?  // @ 若 obj 是引用类型（包括三种包装类型 Number、String、Boolean）
			class2type[ toString.call(obj) ] || "object" :  // @ 则指出其具体的类型（number、string、boolean、date、array、regexp、error、function、object）
			typeof obj;  // @ 若 obj 是除 undefined 和 null 之外的基本类型，则直接返回其 typeof 的值（number、string、boolean）
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script = document.createElement( "script" );

		script.text = code;
		document.head.appendChild( script ).parentNode.removeChild( script );
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( isArray ) {
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android<4.1, PhantomJS<2
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),
function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();  // @ 这样 class2type 中就保存了 toString() 方法返回结果（[object Xxx]）到 xxx 的映射
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}

return jQuery;
});
