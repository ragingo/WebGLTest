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
      if (elem) {
        result.push(elem);
      }
    } else if (key[0] == '.') {
      let elems = document.getElementsByClassName(key.substr(1));
      for (let i = 0; i < elems.length; i++) {
        result.push(elems[i] as HTMLElement); // TODO: 合法？
      }
    } else if (/^<[0-9a-zA-Z]+>$/.test(key)) {
      let name = key.substring(1, key.length - 1);
      let elems = document.getElementsByTagName(name);
      for (let i = 0; i < elems.length; i++) {
        result.push(elems[i] as HTMLElement); // TODO: 合法？
      }
    } else {
      let elems = document.getElementsByName(key);
      for (let i = 0; i < elems.length; i++) {
        result.push(elems[i]);
      }
    }
    return result;
  }

  public static getElem(key: string): HTMLElement | null {
    let elems = DomUtil.getElems(key);
    if (elems && elems.length > 0) {
      return elems[0];
    }
    return null;
  }
}
