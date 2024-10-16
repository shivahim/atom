export class AppMount {
	
	#node;
	#observer;
	
	#onMount = [];
	#unMount = [];
	
	constructor(node) {
		if(!node) throw Error("Missing Html Node to monitor");
		this.#node = node;
	}
	
	init() {
		this.#observer = new MutationObserver(mutationList => {
			for(let mutation of mutationList) {
				
				for(let addedNode of mutation.addedNodes) {
					if(addedNode === this.#node || addedNode.contains(this.#node)) {
						if(this.#onMount.length > 0) this.#onMount.forEach(callback => callback());
						// observer.disconnect();
						break;
					}
				}
				
				for(let removedNode of mutation.removedNodes) {
					if(removedNode === this.#node || removedNode.contains(this.#node)) {
						if(this.#unMount.length > 0) this.#unMount.forEach(callback => callback());
						// observer.disconnect();
						break;
					}
				}
			}
		});
		this.#observer.observe(document, {childList: true, subtree: true});
		// parentNode.appendChild(this.node);
	}
	
	onLoad = (callback, extra = null) => {
		if(!(callback && typeof callback === "function")) throw new Error("Invalid callback for onLoad event");
		let target = this.#node;
		this.#onMount.push(() => callback(target, extra));
		if(!this.#observer) this.init();
		return this;
	};
	
	unLoad = (callback, extra = null) => {
		if(!(callback && typeof callback === "function")) throw new Error("Invalid callback for unload event");
		let target = this.#node;
		this.#unMount.push(() => callback(target, extra));
		if(!this.#observer) this.init();
		return this;
	};
	
	clearLoad = () => {
		this.#onMount = [];
		return this;
	};
	
	clearUnLoad = () => {
		this.#unMount = [];
		return this;
	};
}