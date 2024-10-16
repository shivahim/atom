export class AppSession {
	
	static setLocal = (name, value) => {
		if(!localStorage) return false;
		console.info("Storing in Local Storage");
		localStorage.setItem(name, value);
		return true;
	};
	
	static setCookie = (name, value) => {
		const expires = "";
		AppSession.setLocal(name, value);
		document.cookie = `${name}=${value};expires=${expires};path=/`;
		return true;
	};
	
	static getLocal = name => {
		if(!localStorage) {
			console.info("No Local Storage Is Available");
			return undefined;
		}
		return localStorage.getItem(name);
	};
	
	static getCookie = name => {
		
		const cookie = AppSession.getLocal(name);
		if(cookie) {
			console.info("COOKIE FOUND IN LOCAL STORAGE");
			return cookie;
		}
		
		console.info("NO COOKIE FOUND IN LOCAL STORAGE, CHECKING DOCUMENT COOKIE");
		let cookieArr = document.cookie && document.cookie.split(";");
		if(!cookieArr) return undefined;
		for(let index = 0; index < cookieArr.length; index++) {
			let cookiePair = cookieArr[index].split("=");
			if(name === cookiePair[0].trim()) return decodeURIComponent(cookiePair[1]);
		}
	};
	
	
	static deleteLocal = name => {
		if(!localStorage) {
			console.info("No Local Storage Is Available");
			return undefined;
		}
		const item = localStorage.getItem(name);
		localStorage.removeItem(name);
		return item;
	};
	
	static deleteCookie = name => {
		if(localStorage) localStorage.removeItem(name);
		document.cookie = `${name}=;path=/`;
	};
	
	// Convert blob to Base64
	static setBlobToLocal = async (name, blob) => {
		await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = function() {
				localStorage.setItem(name, reader.result);
				resolve(blob);
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
		return await AppSession.getBlobFromLocal(name);
	};
	
	// Convert Base64 to blob
	static getBlobFromLocal = async (name) => {
		const base64 = localStorage.getItem(name);
		if(!base64) return undefined;
		const response = await fetch(base64);
		return response.blob();
	};
}