import { type Pointer, ptr, toArrayBuffer } from "bun:ffi";

export function encodeString(str: string) {
	return ptr(new TextEncoder().encode(`${str}\0`));
}

export function decodeString(ptr: Pointer): string {
	const arr = toArrayBuffer(ptr);
	const enc = new TextDecoder("utf-8");
	return enc.decode(arr);
}
