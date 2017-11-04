"use strict";
class HttpUtil {
    static async get(url, responseType) {
        return new Promise(resolve => {
            let xhr = new XMLHttpRequest();
            xhr.addEventListener("loadend", function () {
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
                xhr.responseType = responseType;
            }
            xhr.open("GET", url);
            xhr.send();
            console.log("start http request. (" + url + ")");
        });
    }
    static async getText(url) {
        let xhr = await HttpUtil.get(url);
        return new Promise(resolve => {
            return resolve(xhr.responseText);
        });
    }
    static async getRaw(url) {
        let xhr = await HttpUtil.get(url);
        return new Promise(resolve => {
            return resolve(xhr.response);
        });
    }
    static async getBinary(url) {
        let xhr = await HttpUtil.get(url, "arraybuffer");
        return new Promise(resolve => {
            return resolve(xhr.response);
        });
    }
}
class DomUtil {
    static getElems(key) {
        if (!key) {
            return null;
        }
        let result = [];
        if (key[0] == '#') {
            let elem = document.getElementById(key.substr(1));
            if (elem) {
                result.push(elem);
            }
        }
        else if (key[0] == '.') {
            let elems = document.getElementsByClassName(key.substr(1));
            for (let i = 0; i < elems.length; i++) {
                result.push(elems[i]);
            }
        }
        else if (/^<[0-9a-zA-Z]+>$/.test(key)) {
            let name = key.substring(1, key.length - 1);
            let elems = document.getElementsByTagName(name);
            for (let i = 0; i < elems.length; i++) {
                result.push(elems[i]);
            }
        }
        else {
            let elems = document.getElementsByName(key);
            for (let i = 0; i < elems.length; i++) {
                result.push(elems[i]);
            }
        }
        return result;
    }
    ;
    static getElem(key) {
        let elems = DomUtil.getElems(key);
        if (elems && elems.length > 0) {
            return elems[0];
        }
        return null;
    }
}
class ArrayUtil {
    static toHTMLElements(array) {
        let result = [];
        for (let i = 0; i < array.length; i++) {
            let item = array[i];
            result.push(item);
        }
        return result;
    }
    static pushAll(src, dst) {
        src.forEach(x => dst.push(x));
    }
}
