export class AppState {
	#value;
	
	/** @type Array */
	#callbacks;
	
	constructor(value) {
		this.#value = value;
		this.#callbacks = [];
	}
	
	get value() {
		return this.#value;
	}
	
	call = callback => this.#callbacks.push(callback);
	replCall = (callback, replacement) => {
		if(!this.#callbacks.includes(callback)) return false;
		const index = this.#callbacks.indexOf(callback);
		this.#callbacks[index] = replacement;
		return !this.#callbacks.includes(callback) && this.#callbacks.includes(replacement);
	};
	delCall = callback => {
		if(!this.#callbacks.includes(callback)) return false;
		const index = this.#callbacks.indexOf(callback);
		this.#callbacks.splice(index, 1);
		return !this.#callbacks.includes(callback);
	};
	
	check = () => {
		console.info(this.#callbacks);
	};
	
	set change(value) {
		this.#value = value;
		this.#callbacks.forEach(callback => callback(this.#value));
	};
	
}

export const appState = value => new AppState(value);

export const shareProps = function(method, props, ...args) {
	return method.bind(props, ...args);
};
export const shareCall = function(method, props, ...args) {
	return method.call(props, ...args);
};