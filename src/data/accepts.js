define([
	"../core"
], function( jQuery ) {

/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( elem ) {
	var noData = jQuery.noData[ (elem.nodeName + " ").toLowerCase() ],  // @ applet 标签、embed 标签、object 标签（flash 除外）都是不可存储数据的
		nodeType = +elem.nodeType || 1;  // @ 加号强制 elem.nodeType 转换为数字

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?  // @ 1: HTMLElement 9: HTMLDocument
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute("classid") === noData;  // @ 不是 noData 的情况，直接返回 true，否则进一步看是否是 flash 的 object 标签元素：若是，则返回 true，若否，则返回 false
};

return jQuery.acceptData;
});
