export class AppFlow {
	
	static #next = async (previousResult, callback) => {
		if(!callback || typeof callback !== "function") {
			throw new Error("Invalid callback for next");
		}
		return await callback(previousResult);
	};
	
	static #checkWithCallBack = (previousResult, callback) => {
		if(callback !== undefined) {
			if(callback instanceof Function)
				return callback(previousResult);
			return callback;
		}
		return previousResult;
	};
	
	/**
	 * Creates a proxy to create the chain of callbacks from an object
	 * @param {object} object
	 * @param {boolean} noArgs
	 * @return {Proxy<*>}
	 */
	static chain = (object, noArgs = false) => {
		let index = -1;
		const ifStack = [];
		const loopStack = [];
		const ifEnds = {};
		const loopEnds = {};
		
		const proxy = new Proxy({object, chain: []}, {
			get(target, prop) {
				++index;
				const fnArgs = callback => {
					target.chain.push({name: prop, args: callback});
					return proxy;
				};
				
				const fn = prop => {
					target.chain.push({name: prop});
					return proxy;
				};
				
				switch(prop) {
					case "run":
					case "chart":
					case "report":
						return async (initial, callback) =>
							await AppFlow.#run(
								target.chain, target.object,
								ifEnds, loopEnds,
								callback, initial, prop === "report");
					
					case "if":
						ifStack.push(index);
						return fnArgs;
					case "loop":
						loopStack.push(index);
						return fnArgs;
					
					case "endif":
						ifEnds[ifStack.pop()] = index;
						return fn(prop);
					
					case "endloop":
						loopEnds[loopStack.pop()] = index;
						return fn(prop);
					
					case "exit":
					case "next":
					case "reset":
					case "elseif":
						return fnArgs;
					
					default:
						if(!(prop in target.object))
							throw new Error(`Invalid Task ${prop}`);
						
						if(noArgs) {
							target.chain.push({name: prop});
							return proxy;
						}
						
						return (...args) => {
							target.chain.push({name: prop, args});
							return proxy;
						};
					
				}
			},
			has(target, prop) {
				return prop in target.object;
			}
		});
		return proxy;
	};
	
	
	/**
	 * Execute the callbacks from chain of callback references
	 * @param {Array} chain			An array of pair of callback name and arguments
	 * @param {Object} object		Object form which callback will be called
	 * @param {Object} ifEnds
	 * @param {Object} loopEnds
	 * @param {Function} callback	Function which will be called with the result of the chain
	 * @param {*} initial			Any value to start the chain
	 * @param {boolean} isReport
	 * @return {Promise<*>}
	 */
	static #run = async (chain, object, ifEnds, loopEnds, callback, initial, isReport) => {
		let temp;
		let exit = false;			// If true, exit immediately
		let reset = false;			// If true, reset the chain with current value
		let result = initial;		// Result of each call, initialize with initial, will be passed as essential first argument to next call
		const loopStack = [];		//
		
		const report = [];
		const checkArgs = args => args || [];
		const inReport = (task, value, result) => isReport ? report.push({task, value, result}) : undefined;
		
		
		do {
			reset = false;
			inReport("Initialize", result);
			for(let index = 0; index < chain.length; index++) {
				if(reset || exit) break; // End the chain immediately
				const currentTask = chain[index];		// Meta about current task
				const task = currentTask.name;			// A name of method in chain or Flow Control
				const args = currentTask.args;			// Optional Arguments supplied to call
				
				switch(task) {
					// If true continue the chain else broke the chain till a matching endif encountered
					case "if":
						inReport("if", result, AppFlow.#checkWithCallBack(result, args));
						if(!AppFlow.#checkWithCallBack(result, args)) {
							index = ifEnds[index];
							if(!index) exit = true;
						}
						break;
					
					// Loop through the next subsequent calls until loop is true
					case "loop":
						inReport("loop", result, AppFlow.#checkWithCallBack(result, args));
						if(!AppFlow.#checkWithCallBack(result, args)) {
							index = loopEnds[index];
							if(!index) exit = true;
						} else loopStack.push(index - 1);
						break;
					
					// Mark the end for an if block.
					// Mark the end for the loop block.
					case "endif":
					case "endloop":
						inReport(task, result);
						index = task === "endloop" ? loopStack.pop() : index;
						break;
					
					// Call the args as callback with the result & initial value
					case "next":
						temp = result;
						result = await AppFlow.#next(result, args);
						inReport("next", temp, result);
						break;
					
					// Reset the chain with the current value of result
					case "reset":
						reset = true;
						temp = result;
						result = AppFlow.#checkWithCallBack(result, args);
						inReport("reset", temp, result);
						break;
					
					// Exit the chain with the current value of result
					case "exit":
						exit = true;
						inReport("ext", result);
						result = AppFlow.#checkWithCallBack(result, args);
						break;
					
					default:
						if(!(task in object)) throw new Error("Invalid Task in Chain : " + task);
						temp = result;
						result = await object[task](result, initial, ...checkArgs(args));
						inReport(task, [temp, ...checkArgs(args)], result);
				}
			}
		} while(reset);
		
		// If callback is available, return the result of callback else result
		return callback ? callback(isReport ? report : result, initial) : (isReport ? report : result);
	};
}