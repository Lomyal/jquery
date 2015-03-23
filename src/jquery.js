define([
	"./core",
	"./selector",
	"./traversing",  // @ 加载此模块时，第一次加载了 core/init 模块，因为其中使用了 jQuery() 构造 jQuery 对象
	"./callbacks",
	"./deferred",
	"./core/ready",
	"./data",
	"./queue",
	"./queue/delay",
	"./attributes",
	"./event",
	"./event/alias",
	"./manipulation",
	"./manipulation/_evalUrl",
	"./wrap",
	"./css",
	"./css/hiddenVisibleSelectors",
	"./serialize",
	"./ajax",
	"./ajax/xhr",
	"./ajax/script",
	"./ajax/jsonp",
	"./ajax/load",
	"./event/ajax",
	"./effects",
	"./effects/animatedSelector",
	"./offset",
	"./dimensions",
	"./deprecated",
	"./exports/amd"
], function( jQuery ) {

return (window.jQuery = window.$ = jQuery);

});
