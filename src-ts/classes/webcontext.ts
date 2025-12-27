import type { Pointer } from "bun:ffi";
import { resolve } from "node:path";
import { rod_webcontext_create, rod_webcontext_destroy } from "../ffi";
import { encodeString } from "../utilities/strings";

export default class WebContext {
	readonly path: string;
	readonly ptr: Pointer;

	constructor(path: string) {
		this.path = resolve(path);

		const ptr = rod_webcontext_create(encodeString(this.path));
		if (!ptr) throw new Error("Failed to create WebContext");
		this.ptr = ptr;
	}

	destroy() {
		rod_webcontext_destroy(this.ptr);
	}
}
