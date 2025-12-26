import { CString, FFIType, JSCallback, type Pointer } from "bun:ffi";
import {
	rod_event_loop_create,
	rod_event_loop_destroy,
	rod_event_loop_poll,
} from "../ffi";

export default class EventLoop {
	eventloopPtr: Pointer;

	private callback: JSCallback;
	private interval: NodeJS.Timeout;
	constructor() {
		const eventloopPtr = rod_event_loop_create();
		if (!eventloopPtr) throw new Error("Failed to create EventLoop");
		this.eventloopPtr = eventloopPtr;

		this.callback = new JSCallback(
			(eventPtr: Pointer, rawDataPtr: Pointer) => {
				const event = new CString(eventPtr).toString();
				const rawData = new CString(rawDataPtr).toString();
				console.log(event, rawData);
				const data = JSON.parse(rawData);
				console.log("EventLoop Event:", event, data);
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
