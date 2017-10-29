// ragii
// 便利な何かの詰め合わせ
var ragii = {
	dom: {
		// Elements 取得
		// #key  : getElementById(key)
		// .key  : getElementsByClassName(key)
		// <key> : getElementsByTagName(key)
		//  key  : getElementByName(key)
		getElems: function(key) {
			if (!key) {
				return null;
			}

			var elems = null;
			if (key[0] == '#') {
				elems = [ document.getElementById(key.substr(1)) ];
			}
			else if (key[0] == '.') {
				elems = document.getElementsByClassName(key.substr(1));
			}
			else if (/^<[0-9a-zA-Z]+>$/.test(key)) {
				var name = key.substring(1, key.length - 1);
				elems = document.getElementsByTagName(name);
			}
			else {
				elems = [ document.getElementByName(key) ];
			}
			return elems;
		},
		getElem: function(key) {
			var elems = this.getElems(key);
			if (elems.length > 0) {
				return elems[0];
			}
			return null;
		}
	},
	http: {
		// GET リクエスト
		get: function(url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.addEventListener("loadend", function(){
				if (xhr.readyState != 4) {
					console.log("not ready.");
					return;
				}
				if (xhr.status != 200) {
					console.log("http response status error.");
					return;
				}
				if (callback) {
					console.log("begin callback.");
					callback(xhr);
					console.log("end callback.");
				}
			});
			xhr.open("GET", url);
			xhr.send();
			console.log("start http request.");
		},
		// GET リクエスト
		// バイナリデータ受信
		getBinary: function(url, callback) {
			this.get(url, function(xhr) {
				if (!xhr.responseBody) {
					return;
				}
				var buf = new Uint8Array(xhr.responseBody);
				if (callback) {
					callback(buf);
				}
			});
		}
	},
	image: {
		// 埋め込み画像用URI文字列化
		toDataUriString(binary, type) {
			if (!binary) {
				return "";
			}
			if (binary.length == 0) {
				return "";
			}
			var base64 = window.btoa(binary);
			return "data:image/" + type + ";base64," + base64;
		}
	}
};
