export class AppAjax {
	/**
	 * Connects to an AJAX API. Returns a Promise that resolves to the response data.
	 * If callback given, calls the callback with the resolved data & App Node, else replaces the node text with the resolve data.
	 * @param {string} url - The URL of the API endpoint.
	 * @param {function(Result:{any},Response)} [callback=null] - Optional. A callback function that will be called with the result and response.
	 * @param {object} [params=null] - Optional. The parameters to be sent with the API request.
	 * @param {string} [method="post"] - Optional. The HTTP method to be used for the API request. Defaults to "post".
	 * @param {string|null} [type="json"] - Optional. The content type of the API request. Defaults to "json".
	 * @returns {Promise<{result: any, response: Response}>} - Returns a Promise that resolves to an object containing the result  and response of the API call.
	 * @throws {Error} - Throws an error if the response is invalid or if the response status is not present.
	 **/
	
	
	static api = async (url, callback = null, params = {}, method = "post", type = "json") => {
		const options = {};
		options.method = method;
		options.headers = {
			"Content-Type": (() => {
				if(!type) return "application/json";
				switch(type.toLowerCase()) {
					case "json":
					default:
						return "application/json";
				}
			})()
		};
		
		if(method === "post" && params) options.body = JSON.stringify(params);
		
		const response = await fetch(url, options);
		if(!response) throw new Error("Invalid Response received. Please check your connection");
		const result = !type ? null : (response.headers.get("content-type").includes("json") ? await response.json() : await response.text());
		if(callback) callback(result, response);
		return {result, response};
	};
	
	/**
	 * Same as api. Only for GET requests.
	 * @param {string} url
	 * @param {Function|null} callback
	 * @param {string} type
	 * @return {Promise<*>}
	 */
	static apiGet = async (url, callback = null, type = "text") => await AppAjax.api(url, callback, null, "get", type);
	
	/**
	 * Same as api. Only for POST requests.
	 * @param {string} url - The URL of the API endpoint.
	 * @param {function(Result:{message:string,result:boolean,data:any}, Response)} [callback=null] - Optional. A callback function that will be called with the result and
	 * response.
	 * @param {object} [params=null] - Optional. The parameters to be sent with the API request.
	 * @param {string} [type="json"] - Optional. The content type of the API request. Defaults to "json".
	 * @returns {Promise<{result: object|string, response: Response}>} - Returns a Promise that resolves to an object containing the result  and response of the API call.
	 */
	static apiPost = async (url, callback, params = {}, type = "json") => await AppAjax.api(url, callback, params, "post", type);
	
	/**
	 * Same as apiGet. Replaces the node html with the resolved data.
	 * @param {string} url
	 * @param {Function|null} callback
	 * @return {Promise<*>}
	 */
	static apiHtml = async (url, callback = null) => await AppAjax.api(url, callback, null, "get", "html");
	
	/**
	 * Same as apiGet. Replaces the node text with the resolved data.
	 * @param {string} url
	 * @param {Function|null} callback
	 * @return {Promise<*>}
	 */
	static apiText = async (url, callback = null) => await AppAjax.api(url, callback, null, "get", "html");
	
	static apiJson = async (url, callback = null, method = "get") => await AppAjax.api(url, callback, null, method);
	
	static apiGetBlob = async (url, callback = null, params = {}) => {};
	static apiPostBlob = async (url, callback = null, params = {}) => await AppAjax.api(url, callback, params, "post", null);
}