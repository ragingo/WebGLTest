"use strict";
class HttpUtils {
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
        let xhr = await HttpUtils.get(url);
        return new Promise(resolve => {
            return resolve(xhr.responseText);
        });
    }
    static async getRaw(url) {
        let xhr = await HttpUtils.get(url);
        return new Promise(resolve => {
            return resolve(xhr.response);
        });
    }
    static async getBinary(url) {
        let xhr = await HttpUtils.get(url, "arraybuffer");
        return new Promise(resolve => {
            return resolve(xhr.response);
        });
    }
}
