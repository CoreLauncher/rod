import { CString, FFIType, JSCallback, type Pointer } from "bun:ffi";
import { TypedEmitter } from "tiny-typed-emitter";
import {
	rod_event_loop_create,
	rod_event_loop_destroy,
	rod_event_loop_poll,
} from "../ffi";
import type { Position, Size } from "../types";

interface EventLoopEvents {
	window_close_requested: (id: number) => void;
	window_focused: (id: number, focused: boolean) => void;
	window_moved: (id: number, position: Position) => void;
	window_resized: (id: number, size: Size) => void;
}

export default class EventLoop extends TypedEmitter<EventLoopEvents> {
	eventloopPtr: Pointer;

	private callback: JSCallback;
	private interval: NodeJS.Timeout;
	constructor() {
		super();

		const eventloopPtr = rod_event_loop_create();
		if (!eventloopPtr) throw new Error("Failed to create EventLoop");
		this.eventloopPtr = eventloopPtr;

		this.callback = new JSCallback(
			(eventPtr: Pointer, rawDataPtr: Pointer) => {
				const event = new CString(eventPtr).toString();
				const rawData = new CString(rawDataPtr).toString();
				const data = JSON.parse(rawData);

				switch (event) {
					case "window_close_requested":
						return this.emit("window_close_requested", data.id);
					case "window_focused":
						return this.emit("window_focused", data.id, data.focused);
					case "window_moved":
						return this.emit("window_moved", data.id, {
							x: data.x,
							y: data.y,
						});
					case "window_resized":
						return this.emit("window_resized", data.id, {
							width: data.width,
							height: data.height,
						});
				}
			},
			{
				args: [FFIType.cstring, FFIType.cstring],
				returns: FFIType.void,
			},
		);

		this.interval = setInterval(() => {
			rod_event_loop_poll(this.eventloopPtr, this.callback);
		});
	}

	destroy() {
		clearInterval(this.interval);
		if (this.eventloopPtr) {
			rod_event_loop_destroy(this.eventloopPtr);
			this.eventloopPtr = null as unknown as Pointer;
		}
	}
}
