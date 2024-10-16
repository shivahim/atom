import {isValidArray} from "./appTools.js";
import {AppEvent, eventsList} from "./appEvent.js";

export class AppHtml {
	static #element;
	static #newTag;
	
	static set = (param, value, oldValue, element = AppHtml.ele()) => {
		AppHtml.init(element);
		switch(param) {
			case "text":
				AppHtml.text(value);
				break;
			case "html":
				AppHtml.html(value);
				break;
			case "class":
				oldValue ? AppHtml.replaceClass(oldValue, value) : AppHtml.class(value);
				break;
			case "style":
				AppHtml.style(value);
				break;
			case "event":
				for(let event in value) AppHtml.event(event, value[event]);
				break;
			case "click":
			case "onclick":
			case "onClick":
				AppHtml.click(value);
				break;
			case "enter":
				AppHtml.enter(value);
				break;
			default:
				(eventsList.includes(param) ? AppHtml.event : AppHtml.attr)(param.toLowerCase(), value);
		}
		return AppHtml;
	};
	
	/**
	 * Get Current Element
	 * @return {HTMLElement}
	 */
	static ele = () => AppHtml.#element;
	
	/**
	 * Get Newly Created Tag
	 * @return {HTMLElement}
	 */
	static newTag = () => AppHtml.#newTag;
	
	/**
	 * Create New Tag/Element
	 * @param {String} name
	 * @return {typeof AppHtml}
	 */
	static tag = name => {
		AppHtml.#newTag = document.createElement(name);
		return AppHtml;
	};
	
	/**
	 * Initialise current element with another element
	 * @param {HTMLElement|DocumentFragment} element
	 * @return {typeof AppHtml}
	 */
	static init = element => ((AppHtml.#element = element) || true) && AppHtml;
	
	/**
	 * Initialise current element with Element Id
	 * @param {String} tagId
	 * @return {typeof AppHtml}
	 */
	static initId = tagId => {
		AppHtml.#element = document.getElementById(tagId);
		return AppHtml;
	};
	
	/**
	 * Initialise Current Element with New Tag
	 * @return {typeof AppHtml}
	 */
	static initNewTag = () => {
		AppHtml.#element = AppHtml.#newTag;
		return AppHtml;
	};
	
	/**
	 * Add New Tag to Parent & Initialize Current Element with New Tag
	 * @param {String} tagName
	 * @param {HTMLElement} parent
	 * @return {typeof AppHtml}
	 */
	static addNdInit = (tagName, parent = AppHtml.ele()) => {
		AppHtml.tag(tagName); // Create New Tag
		parent.appendChild(AppHtml.newTag()); // Append New Tag as Child to Parent
		AppHtml.init(AppHtml.newTag()); // Initialise Current element with New Tag
		return AppHtml;
	};
	
	/**
	 * Initialize Current Element to Parent
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static initParent = (element = AppHtml.ele()) => {
		if(!element.parentElement) {
			console.error("Missing Parent Element to Initialize");
			return null;
		}
		AppHtml.init(element.parentElement);
		return AppHtml;
	};
	
	// Clear Current Element
	static clearElement = () => ((AppHtml.#element = undefined) || true) && AppHtml;
	
	// Execute Callback with Current Element
	static next = callback => ((callback(AppHtml.#element)) || true) && AppHtml;
	
	static event = (event, callback, element = AppHtml.ele()) => {
		AppEvent.add(event, callback, element);
		return AppHtml;
	};
	
	/**
	 * Add/Update CSS Value to Current Element
	 * @param {string} property CSS Property Name
	 * @param {string} value CSS Property Value
	 * @param {HTMLElement} element Element to Update. Default is Current Element
	 * @return {typeof AppHtml}
	 */
	static css = (property, value, element = AppHtml.ele()) => ((element.style[property] = value) || true) && AppHtml;
	
	/**
	 * Add/Update CSS Values in JSON Format to Current Element
	 * @param {Object} styles Css Values JSON Format
	 * @param {HTMLElement} element Element to Update. Default is Current Element
	 * @return {typeof AppHtml}
	 */
	static style = (styles, element = AppHtml.ele()) => {
		for(let prop in styles) element.style[prop] = styles[prop];
		return AppHtml;
	};
	
	/**
	 * Add/Update Attribute Value to Current Element
	 * @param {string} attribute
	 * @param {*} value
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static attr = (attribute, value, element = AppHtml.ele()) => ((element.setAttribute(attribute, value)) || true) && AppHtml;
	
	/**
	 * Add/Update Attribute Values in JSON Format to Current Element
	 * @param {Object} attrs Attribute Values JSON Format
	 * @param {HTMLElement} element Element to Update. Default is Current Element
	 * @return {typeof AppHtml}
	 */
	static attrs = (attrs, element = AppHtml.ele()) => {
		for(let attr in attrs) element.setAttribute(attr, attrs[attr]);
		return AppHtml;
	};
	
	/**
	 * Add Class/Classes to Current Element
	 * @param {string} classNames
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static class = (classNames, element = AppHtml.ele()) => {
		classNames = classNames && classNames.trim();
		if(!classNames) return AppHtml;
		classNames = Array.isArray(classNames) ? classNames : classNames.split(" ");
		element.classList.add(...classNames);
		return AppHtml;
	};
	
	static replaceClass = (oldClass, newClass, element = AppHtml.ele()) => {
		console.info("replacing class : ", oldClass, newClass);
		newClass = newClass && newClass.trim();
		oldClass = oldClass && oldClass.trim();
		
		newClass = Array.isArray(newClass) ? newClass : newClass.split(" ");
		oldClass = Array.isArray(oldClass) ? oldClass : oldClass.split(" ");
		
		element.classList.remove(...oldClass);
		element.classList.add(...newClass);
	};
	
	/**
	 * @param {string} text
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static text = (text, element = AppHtml.ele()) => ((element.textContent = text) || true) && AppHtml;
	
	/**
	 * @param {string} html
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
		// static html = (html, element = AppHtml.ele()) => ((element.insertAdjacentHTML("beforeend", html)) || true) && AppHtml;
	static html = (html, element = AppHtml.ele()) => ((element.innerHTML = html) || true) && AppHtml;
	
	/**
	 * @param {*} value
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static value = (value, element = AppHtml.ele()) => ((element.value = value) || true) && AppHtml;
	
	/**
	 * @param {number} times
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static space = (times, element = AppHtml.ele()) => {
		while(times-- > 0) AppHtml.html("&nbsp;", element);
		return AppHtml;
	};
	
	/**
	 * @param {number} times
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static line = (times, element = AppHtml.ele()) => {
		while(times-- > 0) AppHtml.html("<br/>", element);
		return AppHtml;
	};
	
	/**
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static clear = (element = AppHtml.ele()) => ((element.innerHTML = "") || true) && AppHtml;
	
	/**
	 * @param {HTMLElement} element
	 * @param {string} separator
	 * @return {typeof AppHtml}
	 */
	static capitalLines = (element = AppHtml.ele(), separator = ".") => {
		const lines = element.innerText.split(separator).map(line => line.trim().charAt(0).toUpperCase() + line.trim().slice(1));
		element.textContent = lines.join(". ").trim();
		return AppHtml;
	};
	
	/**
	 * @param {HTMLElement} element
	 * @param {string} separator
	 * @return {AppVegan}
	 */
	static capitalWords = (element = AppHtml.ele(), separator = " ") => {
		const words = element.innerText.split(separator).map(word => word.trim().charAt(0).toUpperCase() + word.trim().slice(1));
		element.textContent = words.join(" ");
		return AppHtml;
	};
	
	/**
	 * @param {HTMLElement} element
	 * @return {ChildNode}
	 */
	static firstChild = (element = AppHtml.ele()) => element.firstChild;
	
	/**
	 * @param {HTMLElement} element
	 * @return {ChildNode}
	 */
	static lastChild = (element = AppHtml.ele()) => element.lastChild;
	
	/**
	 * @param {HTMLElement} element
	 * @return {HTMLElement}
	 */
	static parent = (element = AppHtml.ele()) => element.parentElement;
	
	/**
	 * @param {HTMLElement} element
	 * @return {HTMLCollection}
	 */
	static children = (element = AppHtml.ele()) => element.children;
	
	/**
	 * @param {number} index
	 * @param {HTMLElement} element
	 * @return {HTMLElement}
	 */
	static childAt = (index, element = AppHtml.ele()) => element.children[index];
	
	/**
	 * @param {HTMLElement} node
	 * @param {number} index
	 * @param {HTMLElement} parent
	 * @return {typeof AppHtml}
	 */
	static replAt = (index, node = AppHtml.newTag(), parent = AppHtml.ele()) => ((parent.replaceChild(node, parent.children[index])) || true) && AppHtml;
	
	/**
	 * @param {HTMLElement} node
	 * @param {number} index
	 * @param {HTMLElement} parent
	 * @return {typeof AppHtml}
	 */
	static insertAt = (index, node = AppHtml.newTag(), parent = AppHtml.ele()) => ((parent.insertBefore(node, parent.children[index])) || true) && AppHtml;
	
	/**
	 * @param {HTMLElement} node
	 * @param {HTMLElement} parent
	 * @return {typeof AppHtml}
	 */
	static insertAtStart = (node = AppHtml.newTag(), parent = AppHtml.ele()) => ((parent.insertBefore(node, parent.firstChild) || true) && AppHtml);
	
	/**
	 * @param {HTMLElement} node
	 * @param {HTMLElement} parent
	 * @return {typeof AppHtml}
	 */
	static insertAtEnd = (node = AppHtml.newTag(), parent = AppHtml.ele()) => ((parent.appendChild(node) || true) && AppHtml);
	
	/**
	 * @param {HTMLElement} parent
	 * @return {typeof AppHtml}
	 */
	static popEndToStart = (parent = AppHtml.ele()) => parent.insertBefore(parent.lastChild, parent.firstChild) && AppHtml;
	
	/**
	 * @param {HTMLElement} parent
	 * @return {typeof AppHtml}
	 */
	static popStartToEnd = (parent = AppHtml.ele()) => parent.appendChild(parent.firstChild) && AppHtml;
	
	/**
	 * @param {Function} callback
	 * @param {*} extra
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static click = (callback, extra = null, element = AppHtml.ele()) => (AppEvent.onClick(element, callback, extra) || true) && AppHtml;
	
	/**
	 * @param {Function} callback
	 * @param {*} extra
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static enter = (callback, extra = null, element = AppHtml.ele()) => (AppEvent.onEnter(element, callback, extra) || true) && AppHtml;
	
	/**
	 *
	 * @param {Array<Object>} dataArray
	 * @param {string|Array|null} includes
	 * @param {HTMLElement} element
	 * @return {typeof AppHtml}
	 */
	static    dataTable = (dataArray, includes = null, element = AppHtml.ele()) => {
		if(includes && typeof includes === "string") includes = includes.trim().split(" ");
		const heads = (isValidArray(includes) && includes) || (isValidArray(dataArray) && Object.keys(dataArray[0]));
		if(!heads || heads.length === 0) return AppHtml;
		
		const table = AppHtml.tag("table").initNewTag().ele();
		const headRow = AppHtml.init(table).tag("tr").insertAtEnd().newTag();
		
		
		heads.forEach(head => AppHtml.init(headRow).addNdInit("th").text(head));
		dataArray.forEach(record => {
			const tr = AppHtml.init(table).tag("tr").insertAtEnd().newTag();
			heads.forEach(head => AppHtml.init(tr).addNdInit("td").text(record[head]));
		});
		AppHtml.#newTag = table;
		
		AppHtml.init(element).insertAtEnd(table);
		
		return AppHtml;
	};
}