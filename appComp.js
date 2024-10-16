export class AppComp {
	static #element;
	
	static init = elementId => {
		AppComp.#element = document.getElementById(elementId);
		return AppComp;
	};
	
	static create = elementName => {
		AppComp.#element = document.createElement(elementName);
		const fragment = document.createDocumentFragment();
		fragment.append(AppComp.#element);
		return AppComp;
	};
	
	static element = () => AppComp.#element;
	
	static initParent = () => {
	
	};
}