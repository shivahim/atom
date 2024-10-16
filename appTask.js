export class AppTask {
	/**
	 * List of tasks with respective callback array
	 * @type {{}}
	 */
	#tasks = {};
	
	constructor() {
		return new Proxy(this, {
			get(target, prop) {
				if(prop in target) return target[prop];
				else if(prop in target.#tasks) return target.#tasks[prop];
				throw new Error(`Invalid AppTask property ${prop}`);
			},
			has(target, prop) {
				return prop in target || prop in target.#tasks;
			}
		});
	}
	
	
	/**
	 * Push callback to task array in tasks object
	 * @param {string} task
	 * @param {Function} callback
	 */
	on = (task, callback) => {
		// if(!(task in this.#tasks)) this.#tasks[task] = [];
		// this.#tasks[task].push(callback);
		this.#tasks[task] = callback;
	};
	
	remove = task => {
		delete this.#tasks[task];
	};
}

export const appTask = () => new AppTask();