import type { Pointer } from "bun:ffi";
import {
	rod_webview_clear_all_browsing_data,
	rod_webview_close_devtools,
	rod_webview_create,
	rod_webview_destroy,
	rod_webview_get_url,
	rod_webview_is_devtools_open,
	rod_webview_open_devtools,
	rod_webview_reload,
	rod_webview_set_html,
	rod_webview_set_url,
	rod_webview_zoom,
	rod_window_destroy,
} from "../ffi";
import type { WebViewOptions, WindowOptions } from "../types";
import { transformWebViewOptions } from "../utilities/options";
import { encodeString } from "../utilities/strings";
import type EventLoop from "./eventloop";
import Window from "./window";

export default class WebView extends Window {
	protected webviewPtr: Pointer;
	constructor(eventLoop: EventLoop, options: WebViewOptions & WindowOptions) {
		super(eventLoop.eventloopPtr, options);

		const webviewPtr = rod_webview_create(
			this.windowPtr,
			encodeString(JSON.stringify(transformWebViewOptions(options))),
		);
		if (!webviewPtr) throw new Error("Failed to create WebView");
		this.webviewPtr = webviewPtr;
	}

	get url() {
		const raw = rod_webview_get_url(this.webviewPtr);
		return raw.toString();
	}

	get isDevtoolsOpen() {
		return rod_webview_is_devtools_open(this.webviewPtr);
	}

	setUrl(url: string) {
		rod_webview_set_url(this.webviewPtr, encodeString(url));
	}

	setHtml(html: string) {
		rod_webview_set_html(this.webviewPtr, encodeString(html));
	}

	reload() {
		rod_webview_reload(this.webviewPtr);
	}

	clearAllBrowsingData() {
		rod_webview_clear_all_browsing_data(this.webviewPtr);
	}

	openDevtools() {
		rod_webview_open_devtools(this.webviewPtr);
	}

	closeDevtools() {
		rod_webview_close_devtools(this.webviewPtr);
	}

	zoom(scaleFactor: number) {
		rod_webview_zoom(this.webviewPtr, scaleFactor);
	}

	override destroy() {
		if (this.webviewPtr) {
			rod_webview_destroy(this.webviewPtr);
			this.webviewPtr = null as unknown as Pointer;
		}
		if (this.windowPtr) {
			rod_window_destroy(this.windowPtr);
			this.windowPtr = null as unknown as Pointer;
		}
	}
}
