export class AppHtml {
	/**
	 * @type {DocumentFragment|HTMLElement}
	 * @private
	 */
	static #root;
	
	/**
	 * @param {HTMLElement} [root]
	 * @return {typeof AppHtml}
	 * @public
	 */
	static set = root => {
		AppHtml.#root = root;
		return AppHtml;
	};
	
	/**
	 * @return {HTMLElement}
	 */
	static get = () => AppHtml.#root;
	
	static #check = () => {
		if(!AppHtml.get()) throw Error("No Root Found");
		if(!(AppHtml.get() instanceof HTMLElement)) throw Error("Invalid DHTML Root");
		return AppHtml;
	};
	
	static text = text => {
		AppHtml.#check().get().textContent = text;
		return AppHtml;
	};
	
	static class = (names, add = true) => {
		const ele = AppHtml.#check().get();
		add ? ele.classList.add(...names.split(" ")) : ele.classList.remove(...names.split(" "));
		return AppHtml;
	};
	
	/**
	 * Add/Update CSS Values in JSON Format to Current Element
	 * @param {Object} styles Css Values JSON Format
	 * @return {typeof AppHtml}
	 */
	static style = styles => {
		const element = AppHtml.#check().get();
		for(let prop in styles) element.style[prop] = styles[prop];
		return AppHtml;
	};
	
	/**
	 * Add/Update Attribute Values in JSON Format to Current Element
	 * @param {Object} attrs Attribute Values JSON Format
	 * @return {typeof AppHtml}
	 */
	static attrs = (attrs) => {
		const element = AppHtml.#check().get();
		for(let attr in attrs) element.setAttribute(attr, attrs[attr]);
		return AppHtml;
	};
	
	static event = (eventName, callback, add = true) => {
		const ele = AppHtml.#check().get();
		add ? ele.addEventListener(eventName, ev => callback(ev, AppHtml.get()))
			: ele.removeEventListener(eventName, callback);
		return AppHtml;
	};
	
	static add = node => {
		AppHtml.#check().get().appendChild(node);
		return AppHtml;
	};
	
	static click = (callback, extra) => {
		AppHtml.#check().get().addEventListener("click", ev => callback(ev, AppHtml.get(), extra));
		return AppHtml;
	};
	
	/**
	 * @param {String|HTMLElement|DocumentFragment|AppTags} element
	 * @return {HTMLElement|DocumentFragment}
	 * @private
	 */
	static #resolve = element => typeof element === "string"
		? document.getElementById(element)
		: element instanceof AppTags ? element.node() : element;
	
	/**
	 * @param {String} name
	 * @param {String|HTMLElement|DocumentFragment} [element]
	 * @return {typeof AppHtml}
	 * @public
	 */
	static create = (name, element) => {
		AppHtml.#check();
		const newElement = document.createElement(name);
		element && (typeof element === "string" ? (newElement.textContent = element) : newElement.appendChild(element));
		AppHtml.get().appendChild(newElement);
	};
	
	static switch = (name, element) => {
		AppHtml.#check();
		const newElement = document.createElement(name);
		element && (typeof element === "string" ? (newElement.textContent = element) : newElement.appendChild(element));
		AppHtml.get().appendChild(newElement);
		AppHtml.set(newElement);
	};
	
	/**
	 * @param {String} text
	 * @return {typeof AppHtml}
	 * @public
	 */
	static addText = text => {
		AppHtml.#check();
		AppHtml.get().textContent += text;
	};
	
	/**
	 * @param {String|HTMLElement|DocumentFragment} node
	 */
	static addTo = node => {
		node = AppHtml.#resolve(node);
		if(node.contains(AppHtml.get())) {
			console.info(AppHtml.get());
			throw Error("Can't append parent to it's child");
		}
		node.appendChild(AppHtml.get());
	};
}

export class AppTags extends AppHtml {
	#node = document.createDocumentFragment();
	#name;
	
	node = () => this.#node;
	
	/**
	 * @return {typeof AppTags|AppHtml}
	 */
	constructor(name) {
		super();
		this.#name = name;
		const proxy = new Proxy(this, {
			get(target, prop) {
				if(prop in target) return target[prop];
				else if(prop in AppTags) {
					AppTags.set(target.#node);
					console.info(`${prop} for ${target.#name}`);
					return typeof AppTags[prop] !== "function" ? AppTags[prop]
						: (...args) => {
							return AppTags[prop](...args, target.#node) || proxy;
						};
				} else throw Error(`${prop} is not a member of AppTags`);
			}
		});
		
		return proxy;
	}
}