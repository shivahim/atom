export const objEntries = Object.entries;
export const roundOff = (number, decimal = 2) => {
	return +(number.toFixed(decimal));
};

export const randomTillMax = (max, includeZero = true) => Math.floor(Math.random() * (max + (includeZero ? 1 : 0))) + (includeZero ? 0 : 1);
export const isValidArray = (arr, min = 1, max = 0) => arr && Array.isArray(arr) && arr.length >= min && (max < 1 ? true : arr.length <= max);

export const isValidObject = (obj, min = 1) => obj && typeof obj === "object" && !Array.isArray(obj) && Object.keys(obj).length >= min;

export const camelToKebab = text => text.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();

/**
 * @param {Array} arr
 */
export const shuffleArray = arr => {
	let original = [...arr];
	let len = arr.length;
	let randomIndex;
	while(len) {
		randomIndex = Math.floor(Math.random() * len--);
		[arr[len], arr[randomIndex]] = [arr[randomIndex], arr[len]];
	}
	return original;
};

export const getUrlParam = key => new URL(window.location.href).searchParams.get(key);

/**
 * @return {{[p: string]: string}}
 */
export const getUrlJson = () => Object.fromEntries(new URLSearchParams(window.location.href.split("?")[1]));

export const eachProp = (obj, callback) => {
	if(!isValidObject(obj)) return;
	for(let key in obj) callback(key, obj[key]);
};

export const getUrl = () => {
	return new URL(window.location.href);
};