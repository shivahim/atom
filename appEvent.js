import {AppVegan} from "./appVegan.js";

export const eventsList = [
	"click", "onclick", "onClick",
	"mouseup", "mouseUp", "onmouseup", "onMouseUp",
	"mouseout", "mouseOut", "onmouseout", "onMouseOut",
	"mouseover", "mouseOver", "onmouseover", "onMouseOver",
	"mousemove", "mouseMove", "onmousemove", "onMouseMove",
	"keyup", "keyUp", "onkeyup", "onKeyUp",
	"keydown", "keyDown", "onkeydown", "onKeyDown",
	"keypress", "keyPress", "onkeypress", "onKeyPress",
	"onchange", "onChange", "onload", "onLoad", "onfocus", "onFocus",
	"onSubmit", "onsubmit", "onblur", "onBlur", "onunload", "onUnload", "onresize", "onResize"
];

export class AppEvent {
	
	/**
	 * @param {string} event
	 * @param {Function} callback
	 * @param {HTMLElement} node
	 * @param {*} extra
	 * @return {boolean}
	 */
	static add = (event, callback, node, extra) => {
		(node instanceof AppVegan ? node.Node : node).addEventListener(event, ev => callback(ev, node, extra));
		return true;
	};
	
	/**
	 *
	 * @param {HTMLElement} node
	 * @param {Function} callback
	 * @param {*} extra
	 * @return {boolean}
	 */
	static onClick = (node, callback, extra = null) => this.add("click", callback, node, extra);
	
	static onTouch = this.onClick;
	static onKeyUp = (node, callback, extra) => this.add("keyup", callback, node, extra);
	
	static onKeyDown = (node, callback, extra) => this.add("keydown", callback, node, extra);
	
	static onPress = this.onKeyDown;
	
	static onKeyHit = this.onKeyUp;
	
	/**
	 *
	 * @param {HTMLElement} node
	 * @param {Function} callback
	 * @param {*} extra
	 * @return {boolean}
	 */
	static onEnter = (node, callback, extra = null) => this.onKeyHit(node, (ev, node, extra) => {
		if(ev.key === "Enter" || ev.keyCode === 13) callback(node.value, ev, node, extra);
	}, extra);
	
	static onSpace = (node, callback, extra) => this.onKeyHit(node, (ev, node, extra) => {
		if(ev.key === " ") callback(node.value, ev, node, extra);
		
	}, extra);
	
	static onArrow = (node, callback, extra) => this.onPress(node, (ev, node, extra) => {
		if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(ev.key)) callback(ev, node, extra);
	}, extra);
	
	static onArrUp = (node, callback, extra) => this.onPress(node, (ev, node, extra) => {
		if(ev.key === "ArrowUp") callback(ev, node, extra);
	}, extra);
	
	static onArrDown = (node, callback, extra) => this.onPress(node, (ev, node, extra) => {
		if(ev.key === "ArrowDown") callback(ev, node, extra);
	}, extra);
	;
	static onArrLeft = (node, callback, extra) => this.onPress(node, (ev, node, extra) => {
		if(ev.key === "ArrowLeft") callback(ev, node, extra);
	}, extra);
	
	static onArrRight = (node, callback, extra) => this.onPress(node, (ev, node, extra) => {if(ev.key === "ArrowRight") callback(ev, node, extra);}, extra);
	
}