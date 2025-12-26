import type { WebViewOptions, WindowOptions } from "../types";
import EventLoop from "./eventloop";
import WebView from "./webview";

export default class Rod {
	eventLoop: EventLoop;
	constructor() {
		this.eventLoop = new EventLoop();
	}

	createWebView(options: WebViewOptions & WindowOptions = {}) {
		return new WebView(this.eventLoop, options);
	}
}
