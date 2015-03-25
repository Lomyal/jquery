define([
	"./core",
	"./var/rnotwhite"
], function( jQuery, rnotwhite ) {

// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],  // @ 用于在不能立即 fire 时（因为 list 正在 fire 中），暂存 fire 请求
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;  // @ memory 在 options.memory 关闭的情况下不记录数据，在 options.memory 开启的情况下记录最后一次 fire 的数据
			fired = true;  // @ 表示当前 Callbacks 返回的 self 对象创建后，至少 fire 过了一次。除了初始化时 fired 是 undefined，没有把 fired 变为 false 的语句。
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {  // @ 执行 & stopOnFalse 选项的处理
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {  // @ 在上面的执行过程中 有其他 data 被 fire，（没有真正 fire，而是保存在 stack 中了），现在 fire 他们！
						fire( stack.shift() );  // @ 使用 shift() 方法，stack 其实是个队列，保证 FIFO
					}
				} else if ( memory ) {  // @ stack 被禁，在 memory 模式下，清空 list
					list = [];
				} else {
					self.disable();  // @ stack 被禁，在非 memory 模式下，禁用 list
				}
			}
		},
		// Actual Callbacks object
		self = {  // @ Callbacks 对象的全部公有（特权）方法都在这里了F
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {  // @ args 就是是 callbacks.add() 函数接收的参数
						jQuery.each( args, function( _, arg ) {  // @ 函数名不重要，被抛弃。arg 是单个函数对象或一组函数对象（array）
							var type = jQuery.type( arg );
							if ( type === "function" ) {  // @ arg 是单个函数对象
								if ( !options.unique || !self.has( arg ) ) {  // @ 若使用了 unique 选项，则保证不重复插入。
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {  // @ arg 是一组函数对象（array）
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;  // @ firing，将新加入的函数悄悄排在最后，等待 fire
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {  // @ 若 memory 中有记录（一位置 options.memory 一定是开启的），则把最后一次 fire 的 data 在新加入的函数上 fire 一遍。
						firingStart = start;  // @ 只有新加入的函数才 fire
						fire( memory );
					}
				}
				return this;  // @ !! 返回调用此方法的对象本身，因此可支持链式调用。
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {  // @ 找到要删除的函数在数组 list 中的位置，同时做了防御式处理，应对函数不在数组中的情况
							list.splice( index, 1 );  // @ 删除
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );  // @ 一函数两用，模拟函数重载
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {  // @ 禁用 list 的一切活动
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {  // @ 非 memory 模式下，lock() 和 disable() 作用相同；memory 模式下，lock() 作用是使 list 在 firing 时无法再次被 fire。（因为 stack 被禁了）
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );  // @ 如果 firing，则将此次想要 fire 的 data 和环境 压入 stack 中。当前正在 fire 的控制在 fire 完 list 后，会开始 fire stack
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};

return jQuery;
});
