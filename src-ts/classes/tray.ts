import type { Pointer } from "bun:ffi";
import { TypedEmitter } from "tiny-typed-emitter";
import { rod_tray_create, rod_tray_destroy } from "../ffi";
import type { TrayOptions } from "../types";
import { transformTrayOptions } from "../utilities/options";
import { encodeString } from "../utilities/strings";

interface TrayEvents {
	click: () => void;
	destroyed: () => void;
}

export default class Tray extends TypedEmitter<TrayEvents> {
	id: number;
	protected trayPtr: Pointer;
	constructor(id: number, options: TrayOptions) {
		super();

		this.id = id;

		const trayPtr = rod_tray_create(
			this.id,
			encodeString(JSON.stringify(transformTrayOptions(options))),
		);
		if (!trayPtr) throw new Error("Failed to create Tray");
		this.trayPtr = trayPtr;
	}

	destroy() {
		if (!this.trayPtr) return;

		rod_tray_destroy(this.trayPtr);
		this.trayPtr = null as unknown as Pointer;

		this.emit("destroyed");
	}
}
