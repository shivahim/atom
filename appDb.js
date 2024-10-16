export class AppDb {
	
	/** @type {IDBDatabase} */ static #idb;
	/** @type {string} */  static #dbName;
	/** @type {number} */  static #dbVersion = 1;
	
	/**
	 * Initialize the Database Meta through New Database Open Request Object
	 * @param {IDBOpenDBRequest} idb
	 * @param {(idb:IDBDatabase,ev:Event)=>any} [onClose] - Optional
	 */
	static #initIdb = (idb, onClose) => {
		AppDb.#idb = idb.result;
		AppDb.#dbName = AppDb.#idb.name;
		AppDb.#dbVersion = AppDb.#idb.version;
		if(onClose) AppDb.#idb.onclose = onClose && onClose.bind(AppDb.#idb);
	};
	
	/**
	 * Check if Database is initialized or not
	 */
	static checkIdb = () => {
		if(!AppDb.#idb) throw Error("Missing IDB Reference. Please initialize the Database first");
		if(!(AppDb.#idb instanceof IDBDatabase)) throw Error("Invalid IDB Reference. Please re-initialize the database");
	};
	
	/**
	 * Initialize the database
	 * @param {string} databaseName
	 * @param {number} [dbVersion]
	 * @param {(idb:IDBDatabase,ev:Event)=>any} [onClose] - Optional
	 * @return {Promise<IDBDatabase>}
	 */
	static initDatabase = (databaseName, dbVersion, onClose) => {
		const request = indexedDB.open(databaseName, dbVersion);
		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				AppDb.#initIdb(request, onClose);
				resolve(request.result);
			};
			request.onerror = ev => reject(ev.target.error || "Error in Opening Database due to unknown reasons");
		});
	};
	
	/**
	 * Close the Database Interface
	 */
	static closeDatabase = () => AppDb.#idb && AppDb.#idb.close();
	
	/**
	 * Delete Database
	 * @param databaseName
	 * @return {Promise<boolean>}
	 */
	static deleteDatabase = databaseName => {
		const request = indexedDB.deleteDatabase(databaseName);
		return new Promise((resolve, reject) => {
			request.onsuccess = ev => resolve(!request.result);
			request.onerror = ev => reject(ev.target.errror || "Error in Deleting Database due to unknown reasons");
		});
	};
	
	/**
	 * Check if Store Exists
	 * @param {string} storeName
	 * @return {boolean}
	 */
	static checkStore = storeName => {
		AppDb.checkIdb();
		return AppDb.#idb.objectStoreNames.contains(storeName);
	};
	
	/**
	 * Get Store
	 * @param storeName
	 * @return {IDBObjectStore|undefined}
	 */
	static getStore = storeName => {
		if(!AppDb.checkStore(storeName)) return undefined;
		return AppDb.#idb.transaction(storeName, "readwrite").objectStore(storeName);
	};
	
	/**
	 * Create New Store or Upgrade Existing Store with schema
	 * @param {string} storeName
	 * @param {Object} schema
	 * @param {boolean} createNew
	 * @param {string} keyPath
	 * @return {Promise<IDBObjectStore>}
	 */
	static #createOrUpgradeStore = (storeName, schema, createNew = true, keyPath = "id") => {
		AppDb.checkIdb();
		const storeExists = AppDb.checkStore(storeName);
		if(createNew && storeExists) throw Error("Can't create new store since store already exists");
		else if(!createNew && !storeExists) throw Error(`Can't Update store since no store found for ${storeName}`);
		
		AppDb.closeDatabase();
		
		return new Promise(resolve => {
			const request = indexedDB.open(AppDb.#dbName, ++AppDb.#dbVersion);
			
			request.onupgradeneeded = () => {
				AppDb.#initIdb(request);
				const store = createNew ? request.result.createObjectStore(storeName, {keyPath}) : AppDb.getStore(storeName);
				for(let key in schema) {
					key !== keyPath
					&& schema[key].index
					&& store.createIndex(key, key, {unique: schema[key].unique});
				}
			};
			
			request.onsuccess = () => resolve(AppDb.getStore(storeName));
		});
	};
	
	/**
	 * Create New Store
	 * @param {string} storeName
	 * @param {Object} schema
	 * @param {string} keyPath
	 * @return {Promise<IDBObjectStore>}
	 */
	static createStore = (storeName, schema, keyPath = "id") => AppDb.#createOrUpgradeStore(storeName, schema, true, keyPath);
	
	/**
	 * Upgrade Existing Store
	 * @param {string} storeName
	 * @param {Object} schema
	 * @return {Promise<IDBObjectStore>}
	 */
	static upgradeStore = (storeName, schema) => AppDb.#createOrUpgradeStore(storeName, schema, false);
	
	/**
	 * Delete Store
	 * @param {string} storeName
	 * @return {Promise<boolean>}
	 */
	static deleteStore = storeName => {
		AppDb.checkIdb();
		AppDb.closeDatabase();
		return new Promise(resolve => {
			const request = indexedDB.open(AppDb.#dbName, ++AppDb.#dbVersion);
			
			request.onupgradeneeded = () => {
				AppDb.#initIdb(request);
				AppDb.#idb.deleteObjectStore(storeName);
			};
			
			request.onsuccess = () => resolve(!AppDb.checkStore(storeName));
		});
		
	};
	
	static searchByKeyIndex = (storeName, key) => {
		AppDb.checkIdb();
		if(!AppDb.checkStore(storeName)) throw Error(`Missing Store Reference. Please create the store : ${storeName}`);
		const store = AppDb.#idb.transaction(storeName, "readonly").objectStore(storeName);
		const request = store.get(key);
		
		return new Promise((resolve, reject) => {
			request.onsuccess = () => {
				console.info("Resolving Key Search");
				resolve(request.result);
			};
			
			request.onerror = ev => {
				console.info("Rejecting Key Search");
				reject(ev);
			};
		});
	};
	
	static searchByIndex = (storeName, indexName, indexValue) => {
		AppDb.checkIdb();
		if(!AppDb.checkStore(storeName)) throw Error(`Missing Store Reference. Please create the store : ${storeName}`);
		const store = AppDb.#idb.transaction(storeName, "readonly").objectStore(storeName);
		const index = store.index(indexName);
		const request = index.get(indexValue);
		
		return new Promise((resolve, reject) => {
			request.onerror = ev => reject(ev);
			request.onsuccess = () => resolve(request.result);
		});
	};
	
	
	/**
	 * @param {string} storeName
	 * @param {Object} record
	 * @return {Promise<boolean>}
	 */
	static insert = (storeName, record) => {
		if(!AppDb.checkStore(storeName)) throw Error("Missing Store");
		
		return new Promise(resolve => {
			const store = AppDb.getStore(storeName);
			const request = store.add(record);
			
			request.transaction.oncomplete = () => resolve(request.result);
			request.onsuccess = () => {
				console.info("Request Completed : ");
			};
		});
	};
	
	static delete = (storeName, key) => {
		if(!AppDb.checkStore(storeName)) throw Error("Missing Store");
		return new Promise((resolve, reject) => {
			const store = AppDb.getStore(storeName);
			const request = store.delete(key);
			request.onsuccess = () => {
				console.info("Item Deleted");
				resolve(true);
			};
			
			request.onerror = event => {
				console.info("Unable to Delete Item");
				reject(event);
			};
		});
	};
}