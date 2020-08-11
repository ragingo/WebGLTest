class HttpUtil {
  public static async get(url: string, responseType?: string): Promise<XMLHttpRequest> {
    return new Promise<XMLHttpRequest>((resolve) => {
      let xhr = new XMLHttpRequest();
      xhr.addEventListener('loadend', function () {
        if (xhr.readyState != 4) {
          console.log('not ready.');
          return;
        }
        if (xhr.status != 200) {
          console.log('http response status error.');
          return;
        }
        resolve(xhr);
        console.log('request completed.(' + url + ')');
      });
      if (responseType) {
        xhr.responseType = responseType as XMLHttpRequestResponseType;
      }
      xhr.open('GET', url);
      xhr.send();
      console.log('start http request. (' + url + ')');
    });
  }

  public static async getText(url: string): Promise<string> {
    let xhr = await HttpUtil.get(url);
    return new Promise<string>((resolve) => {
      return resolve(xhr.responseText);
    });
  }

  public static async getRaw(url: string): Promise<string> {
    let xhr = await HttpUtil.get(url);
    return new Promise<string>((resolve) => {
      return resolve(xhr.response);
    });
  }

  public static async getBinary(url: string): Promise<ArrayBuffer> {
    let xhr = await HttpUtil.get(url, 'arraybuffer');
    return new Promise<ArrayBuffer>((resolve) => {
      return resolve(xhr.response as ArrayBuffer);
    });
  }
}
