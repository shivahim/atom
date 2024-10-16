import {AppHtml} from "./appHtml.js";
import {AppMount} from "./appMount.js";
import {AppEvent} from "./appEvent.js";
import {camelToKebab} from "./appTools.js";

export class AppVegan {
	/** @type HTMLElement */
	#node;
	
	/** @type AppMount */
	#mount;
	
	prop;
	
	/**
	 * Reference the Html Element wrapped in AppVegan
	 * @return {HTMLElement}
	 */
	get Node() {
		return this.#node;
	}
	
	/**
	 * Executes a callback with this passed as first argument and an optional extra as second argument
	 * @param {Function} callback Function reference to be executed
	 * @param {*} [extra=undefined]  Optional. Second argument for callback
	 * @return this
	 */
	next = (callback, extra) => {
		callback(this, extra);
		return this;
	};
	
	/**
	 * Creates a reference to the AppVegan
	 * @param {HTMLElement|string} element	Name of HtmlElement or instance of HtmlElement
	 * @param {string|AppState} [value=undefined] Optional Text or Object of attributes need to set on HtmlElement
	 */
	constructor(element = "span", value = undefined) {
		if(!element) throw new Error("Missing HtmlElement");
		
		/** @type {HTMLElement} */
		this.#node = typeof element === "string" ? document.createElement(element) : element;
		if(value) {
			if(typeof value === "string") this.Node.innerText = value;
			else this.#customAttrs(value);
		}
		
		this.prop = {};
	}
	
	/**
	 * Executes a callback when the element is loaded/mounted in DOM with this as first argument and extra as optional second argument
	 * @param {Function} callback Function reference to be executed when the element is loaded/mounted
	 * @param {*} [extra=undefined] Optional. Second argument for callback
	 * @return this
	 */
	onload(callback, extra) {
		if(!this.#mount) this.#mount = new AppMount(this.Node);
		this.#mount.onLoad((node, extra) => callback(this, extra), extra);
		return this;
	};
	
	/**
	 * Executes a callback when the element is unloaded/unmounted from DOM with this as first argument and extra as optional second argument
	 * @param {Function} callback Function reference to be executed when the element is loaded/mounted
	 * @param {*} [extra=undefined] Optional. Second argument for callback
	 * @return this
	 */
	unload(callback, extra) {
		if(!this.#mount) this.#mount = new AppMount(this.Node);
		this.#mount.unLoad((node, extra) => callback(this, extra), extra);
		return this;
	};
	
	get clearLoad() {
		this.#mount?.clearLoad();
		return this;
	}
	
	get clearUnload() {
		this.#mount?.clearUnLoad();
		return this;
	}
	
	/**
	 * Set attributes on the HtmlElement
	 * @param {Object} attrs Set attributes and corresponding values
	 * @param {HTMLElement} [ele=this.Node] this.Node HtmlElement to be set. Default is this.Node
	 */
	#customAttrs = (attrs, ele = this.Node) => {
		for(let attr in attrs) {
			let val = attrs[attr];
			switch(attr) {
				case "text":
					AppHtml.text(val, ele);
					break;
				case "class":
					AppHtml.class(val, ele);
					break;
				case "style":
					val = typeof val === "string" ? val : Object.entries(val).map(([key, value]) => `${camelToKebab(key)}:${value}`).join(";");
					AppHtml.attr("style", val, ele);
					break;
				case "click":
				case "onclick":
				case "onClick":
					AppEvent.onClick(ele, ev => val(ev, ele));
					break;
				default:
					AppHtml.attr(attr, val, ele);
			}
		}
	};
	
	/**
	 * Appends new tag or an array of tags to the current App HtmlElement.
	 * If tag is Array, current node will be returned,
	 * Else new tag will be returned as App Node.
	 * @param {AppVegan|AppVegan[]|HTMLElement|HTMLElement[]|string|string[]} elements
	 * Element to append to this App HtmlElement. Can be any HtmlElement, name of an HtmlElement,
	 * or an array of HtmlElements or names of HtmlElements
	 * @param {string|object} value Text or Object of attributes need to set on HtmlElement. Will be used only if element is not an Array
	 * @param {boolean} [newApp=true]	If set true, creates every element as an instance of AppVegan, otherwise creates them as an instance HtmlElement
	 // * @param {boolean} [isSingle=true] If set true, throws an error if element is an Array
	 * @return AppVegan
	 */
	#addTag = (elements, value, newApp = true) => {
		// if(isSingle && Array.isArray(element)) throw new TypeError("App tag must be a single element, array received");
		
		/**
		 * Create a new AppVegan Element
		 * @param {AppVegan|HTMLElement|string} element
		 * @return {AppVegan}
		 */
		const toVegan = element => {
			element = element instanceof AppVegan ? element : new AppVegan(element);
			element.prop = this.prop;
			return element;
		};
		
		/**
		 * Create a new HtmlElement
		 * @param {AppVegan|HTMLElement|string} element
		 * @return {HTMLElement}
		 */
		const toElement = element => typeof element === "string" ? document.createElement(element) : element.Node || element;
		
		/**
		 * Check if Tag is of App type. If not, create a new App Tag.
		 * @param {AppVegan|HTMLElement|string} element
		 * @return {AppVegan}
		 */
		
		const create = element => {
			element = newApp ? toVegan(element) : toElement(element);
			if(value && !Array.isArray(elements)) {
				if(typeof value === "string") (element.Node || element).innerText = value;
				else this.#customAttrs(value, element.Node || element);
			}
			this.Node.appendChild(element.Node || element);
			return element;
		};
		
		if(Array.isArray(elements)) {
			elements.forEach(element => create(element));
			return this;
		} else {
			elements = create(elements);
			return newApp ? elements : this;
		}
	};
	
	/**
	 * Add new element to the current HtmlElement of this as an instance of AppVegan
	 * @param {AppVegan|HTMLElement|string} element
	 * @param {string|object|undefined} value // Text or Object of attributes need to set on element
	 * @return {AppVegan} AppVegan reference of newly added tag
	 */
	veg = (element, value = null) => this.#addTag(element, value, true);
	
	/**
	 * Add new elements(s) to the current HtmlElement of this as instance(s) of HtmlElement
	 * @param {AppVegan|AppVegan[]|HTMLElement|HTMLElement[]|string|string[]} element
	 * @param {string|object} value // Text or Object of attributes need to set on element. Only used element is not Array
	 * @return {AppVegan} Current app vegan reference
	 */
	ele = (element, value) => this.#addTag(element, value, false);
	
	
	/**
	 * THIS SECTION HAS METHODS THAT WILL CREATE NEW VALUES OR REPLACE EXISTING VALUES
	 */
	
	
	/**
	 * Set single CSS property on this HtmlElement
	 * @param {string} style Name of style property
	 * @param {string} value Value of style property
	 * @return this
	 */
	css = (style, value) => AppHtml.css(style, value, this.Node) && this;
	
	/**
	 * Set multiple CSS properties on this HtmlElement
	 * @param {object} styles Set of CSS properties and corresponding values
	 * @return this
	 */
	style = styles => AppHtml.style(styles, this.Node) && this;
	
	/**
	 * Set multiple CSS properties on this HtmlElement
	 * @param {object} styles Set of CSS properties and corresponding values
	 */
	set Style(styles) {
		this.style(styles);
	}
	
	/**
	 * Set single attribute on this HtmlElement
	 * @param {string} attribute Name of the attribute
	 * @param {string} value Value of the attribute
	 * @return this
	 */
	attr = (attribute, value) => AppHtml.attr(attribute, value, this.Node) && this;
	
	
	/**
	 * Set multiple attributes on this HtmlElement
	 * @param {object} attrs Set of attributes and corresponding values
	 * @return this
	 */
	attrs = attrs => AppHtml.attrs(attrs, this.Node) && this;
	
	/**
	 * Add classes/class names to this HtmlElement
	 * @param {string} classNames Names of the classes separated by spaces
	 * @return AppVegan
	 */
	class = classNames => AppHtml.class(classNames, this.Node) && this;
	
	/**
	 * Add classes/class names to this HtmlElement
	 * @param {string} classNames Names of the classes separated by spaces
	 */
	set Class(classNames) {
		AppHtml.class(classNames, this.Node);
	}
	
	/**
	 * Append the text to this HtmlElement
	 * @param {string} text Text to append
	 * @return this
	 */
	text = text => AppHtml.text(text, this.Node) && this;
	
	/**
	 * Append the text to this HtmlElement
	 * @param {string} text Text to append
	 */
	set Text(text) {
		this.text(text);
	}
	
	/**
	 * Gets the inner text of this HtmlElement
	 * @return string
	 * */
	get Text() {
		return this.Node.innerText;
	}
	
	/**
	 * Append the html code
	 * @param {string} html Html coe to append
	 * @return {this}
	 */
	html = html => AppHtml.html(html, this.Node) && this;
	
	/**
	 * Append the html code
	 * @param {string} html Html coe to append
	 */
	set Html(html) {
		this.html(html);
	}
	
	/**
	 * Gets the inner html of this HtmlElement
	 * @return string
	 * */
	get Html() {
		return this.Node.innerHTML;
	}
	
	/**
	 * Sets the value attribute of this HtmlElement, for form elements
	 * @param {string} value Value to set
	 * @return {this}
	 * */
	value = value => AppHtml.value(value, this.Node) && this;
	
	/**
	 * Sets the value attribute of this HtmlElement, for form elements
	 * @param {string} value Value to set
	 * */
	set Value(value) {
		this.Node.value = value;
	}
	
	/**
	 * Gets the value of this HtmlElement, for form elements
	 * @return string
	 * */
	get Value() {
		return this.Node.value;
	}
	
	/**
	 * Add the blank space(s) to this HtmlElement
	 * @param {number} times Number of spaces to add
	 * @return this
	 * */
	space = (times = 1) => AppHtml.space(times, this.Node) && this;
	
	/**
	 * Add the blank space(s) to this HtmlElement
	 * @param {number} times Number of spaces to add
	 * */
	set Space(times) {
		this.space(times);
	}
	
	/**
	 * Add the line break(s) to this HtmlElement
	 * @param {number} times Number of line breaks to add
	 * @return this
	 * */
	line = (times = 1) => AppHtml.line(times, this.Node) && this;
	
	/**
	 * Add the line break(s) to this HtmlElement
	 * @param {number} times Number of line breaks to add
	 * */
	set Line(times) {
		this.line(times);
	}
	
	
	/**
	 * Clears this HtmlElement
	 * @return this
	 */
	get clear() {
		AppHtml.clear(this.Node);
		return this;
	};
	
	/**
	 * Sets the format of the element.
	 * @param {Object} [format] - The format object.
	 * @param {string} [format.text] - The text to replace in the object.
	 * @param {Object} [format.styles] - The styles to be added to the object.
	 * @param {Object} [format.attributes] - The attributes to be added to the object.
	 * @param {string|[]} [format.className] - The class name to be added to the object.
	 */
	
	/**
	 * Modify this HtmlElement according to the specified format
	 * @param {object} format	Set of keys to format and their corresponding values
	 * @return {AppVegan}
	 */
	format = format => {
		this.#customAttrs(format);
		return this;
	};
	
	/**
	 * Replaces the content of the node with new element.
	 * @param {string|HTMLElement|AppVegan|string[]|HTMLElement[]|AppVegan[]} element To replace the content of this HtmlElement
	 * @param {string|object} value // Text or Object of attributes need to set on element
	 * @return {AppVegan}
	 */
	replace = (element, value) => {
		return this.clear.veg(element, value);
	};
	
	/**
	 * THIS SECTION HAS METHODS THAT WILL ADD OR APPEND NEW VALUES
	 */
	
	
	/*/!**
	 * Add a single class or an array/string of classes to the node
	 * @param {string|[]} names
	 * @return AppVegan
	 *!/
	 addClass = names => {
	 names = names && names.trim();
	 if(!names) return this;
	 names = Array.isArray(names) ? names : names.split(" ");
	 this.Node.classList.add(...names);
	 return this;
	 };*/
	
	/**
	 * Replace an Existing Class with a new Class
	 * @param {string} replace
	 * @param {string} to
	 */
	replClass = (replace, to) => {
		if(!this.Node) return;
		this.Node.classList.remove(replace);
		this.Node.classList.add(to);
		return this;
	};
	
	/**
	 * Make every line of the node capitalized
	 * @param {string} separator
	 * @return {AppVegan}
	 */
	capitalLines = (separator = ".") => AppHtml.capitalLines(this.Node, separator) && this;
	
	/**
	 * Make every word of the node capitalized
	 * @param {string} separator
	 * @return {AppVegan}
	 */
	capitalWords = (separator = " ") => AppHtml.capitalWords(this.Node, separator) && this;
	
	/**
	 * Get the child element of the node at specified index as App Node
	 * @param {number} index
	 * @return {AppVegan}
	 */
	childAt = index => new AppVegan(AppHtml.childAt(index, this.Node));
	
	/**
	 * Insert an element into the node at specified index. Returns the inserted element as App Node
	 * @param {HTMLElement|string} tag
	 * @param {number} index
	 * @return {AppVegan}
	 */
	insertAt = (tag, index) => {
		const obj = new AppVegan(tag);
		AppHtml.insertAt(obj.Node, index, this.Node);
		return obj;
	};
	
	/**
	 * Replace the child element of the node at specified index. Returns the replaced element as App Node
	 * @param {string|HTMLElement} tag
	 * @param {number} index
	 * @return {AppVegan}
	 */
	replAt = (tag, index) => {
		const obj = new AppVegan(tag);
		AppHtml.replAt(obj.Node, index, this.Node);
		return obj;
	};
	
	
	/*
	 * GETTERS & SETTERS
	 * */
	
	get first() {
		return new AppVegan(AppHtml.firstChild(this.Node));
	}
	
	get children() {
		return [...AppHtml.children(this.Node)].map(child => new AppVegan(child));
	}
	
	get parent() {
		return new AppVegan(AppHtml.parent(this.Node));
	}
	
	/**
	 * APP EVENT MANIPULATION
	 */
	
	get event() {
		return AppEvent;
	}
	
	click = (callback, extra = undefined) => AppEvent.onClick(this, callback, extra) && this;
	touch = (callback, extra = undefined) => AppEvent.onTouch(this, callback, extra) && this;
	onEnter = (callback, extra = undefined) => AppEvent.onEnter(this, callback, extra) && this;
	keyHit = (callback, extra) => AppEvent.onKeyHit(this, callback, extra) && this;
	keyDown = (callback, extra) => AppEvent.onPress(this, callback, extra) && this;
	keyPress = (callback, extra) => AppEvent.onPress(this, callback, extra) && this;
	arrLeft = (callback, extra) => AppEvent.onArrLeft(this, callback, extra);
	arrRight = (callback, extra) => AppEvent.onArrRight(this, callback, extra);
	
	arrUp = (callback, extra) => AppEvent.onArrUp(this, callback, extra);
	arrDown = (callback, extra) => AppEvent.onArrDown(this, callback, extra);
	onSpace = (callback, extra) => AppEvent.onSpace(this, callback, extra);
	
	
	/**
	 *
	 * @param {object} dataArray
	 * @param {string|Array} includes
	 * @return {AppVegan}
	 */
	dataTable = (dataArray, includes) => {
		const table = new AppVegan("table");
		if(includes && typeof includes === "string") includes = includes.trim().split(" ");
		
		const heads = includes || Object.keys(dataArray[0]);
		
		if(!heads || heads.length === 0) {
			return table;
		}
		
		const headRow = table.veg("tr");
		
		heads.forEach(head => headRow.ele("th", head));
		dataArray.forEach(record => {
			const tr = table.veg("tr");
			heads.forEach(head => tr.veg("td").ele("div", record[head]));
		});
		
		return table;
	};
}

/**
 * Creates a new Vegan App from existing tag id.
 * @param {string} tagId
 * @param {string|object|undefined} value
 * @return {AppVegan}
 */
export const tagId = (tagId, value = null) => new AppVegan(document.getElementById(tagId), value);

/**
 * Creates a new Vegan App by tag name.
 * @param {string} tagName
 * @param {string|object|undefined} value
 * @return {AppVegan}
 */
export const tagNew = (tagName, value = null) => new AppVegan(document.createElement(tagName), value);