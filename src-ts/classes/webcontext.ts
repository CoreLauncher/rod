import type { Pointer } from "bun:ffi";
import { resolve } from "node:path";
import { rod_webcontext_create, rod_webcontext_destroy } from "../ffi";
import { encodeString } from "../utilities/strings";

export default class WebContext {
	readonly path: string;
	readonly webcontextPtr: Pointer;

	constructor(path: string) {
		this.path = resolve(path);

		const webcontextPtr = rod_webcontext_create(encodeString(this.path));
		if (!webcontextPtr) throw new Error("Failed to create WebContext");
		this.webcontextPtr = webcontextPtr;
	}

	destroy() {
		rod_webcontext_destroy(this.webcontextPtr);
	}
}
