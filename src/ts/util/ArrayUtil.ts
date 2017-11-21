
class ArrayUtil {
	public static toHTMLElements<T extends Element>(array: Array<T> | HTMLCollectionOf<T>): Array<HTMLElement> {
		let result: Array<HTMLElement> = [];
		for (let i = 0; i < array.length; i++) {
			let item: Element = array[i];
			result.push(item as HTMLElement);
		}
		return result;
	}

	public static pushAll<T>(src: Array<T>, dst: Array<T>): void {
		src.forEach(x => dst.push(x));
	}
}
