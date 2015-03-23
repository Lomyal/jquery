define([
	"../core",
	"../var/document",
	"../core/init",
	"../deferred"
], function( jQuery, document ) {

// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );  // @ 若 DOMContentLoaded 正常触发，则此监听器会被清除，事件处理函数不会二次执行。
	jQuery.ready();  // @ 核心，执行事件处理函数。
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// We once tried to use readyState "interactive" here,
		// but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {  // @ document.readyState：当 document 文档正在加载时，返回 "loading"，当文档结束渲染但在加载内嵌资源时，返回 "interactive"，当文档加载完成时，返回 "complete"。
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {  // @ 若调用 jQuery.ready.promise 时，文档还还没有加载结束。

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );  // @ 文档渲染结束，但在加载内嵌资源时，触发 $.ready()。这比 window.onload 发生的要早，是 $(document).ready() 与 window.onload 的重要区别。

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );  // @ 如果上面的监听失效，则退化成 window.onload，保证事件处理函数能被执行。（若 DOMContentLoaded 正常触发，则此监听器会被清除，事件处理函数不会二次执行。）
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();

});
