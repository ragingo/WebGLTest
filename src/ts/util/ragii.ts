class HttpUtil {

	public static async get(url: string, responseType?: string): Promise<XMLHttpRequest> {
		return new Promise<XMLHttpRequest>(resolve => {
			let xhr = new XMLHttpRequest();
			xhr.addEventListener("loadend", function(){
				if (xhr.readyState != 4) {
					console.log("not ready.");
					return;
				}
				if (xhr.status != 200) {
					console.log("http response status error.");
					return;
				}
				resolve(xhr);
				console.log("request completed.(" + url + ")");
			});
			if (responseType) {
				xhr.responseType = responseType as XMLHttpRequestResponseType;
			}
			xhr.open("GET", url);
			xhr.send();
			console.log("start http request. (" + url + ")");
		});
	}

	public static async getText(url: string): Promise<string> {
		let xhr = await HttpUtil.get(url);
		return new Promise<string>(resolve => {
			return resolve(xhr.responseText);
		});
	}

	public static async getRaw(url: string): Promise<string> {
		let xhr = await HttpUtil.get(url);
		return new Promise<string>(resolve => {
			return resolve(xhr.response);
		});
	}

	public static async getBinary(url: string): Promise<ArrayBuffer> {
		let xhr = await HttpUtil.get(url, "arraybuffer");
		return new Promise<ArrayBuffer>(resolve => {
			return resolve(xhr.response as ArrayBuffer);
		});
	}

}

class DomUtil {
		// Elements 取得
		// #key  : getElementById(key)
		// .key  : getElementsByClassName(key)
		// <key> : getElementsByTagName(key)
		//  key  : getElementByName(key)
	public static getElems(key: string): Array<HTMLElement> | null {
		if (!key) {
			return null;
		}

		let result: Array<HTMLElement> = [];

		if (key[0] == '#') {
			let elem = document.getElementById(key.substr(1));
			if (elem){
				result.push( elem );
			}
		}
		else if (key[0] == '.') {
			let elems = document.getElementsByClassName(key.substr(1));
			for (let i = 0; i < elems.length; i++) {
				result.push( elems[i] as HTMLElement ); // TODO: 合法？
			}
		}
		else if (/^<[0-9a-zA-Z]+>$/.test(key)) {
			let name = key.substring(1, key.length - 1);
			let elems = document.getElementsByTagName(name);
			for (let i = 0; i < elems.length; i++) {
				result.push( elems[i] as HTMLElement ); // TODO: 合法？
			}
		}
		else {
			let elems = document.getElementsByName(key);
			for (let i = 0; i < elems.length; i++) {
				result.push(elems[i]);
			}
		}
		return result;
	};

	public static getElem(key: string): HTMLElement | null {
		let elems = DomUtil.getElems(key);
		if (elems && elems.length > 0) {
			return elems[0];
		}
		return null;
	}

}

class ArrayUtil
{
	public static toHTMLElements<T extends Element>(array: Array<T> | HTMLCollectionOf<T>): Array<HTMLElement> {
		let result: Array<HTMLElement> = [];
		for(let i = 0; i < array.length; i++) {
			let item: Element = array[i];
			result.push(item as HTMLElement);
		}
		return result;
	}

	public static pushAll<T>(src: Array<T>, dst: Array<T>): void {
		src.forEach(x => dst.push(x));
	}
}
