import type { WebViewOptions, WindowOptions } from "../types";
import EventLoop from "./eventloop";
import WebView from "./webview";

let idIndex = 1;

export default class Rod {
	eventLoop: EventLoop;
	private webviews: WebView[];
	constructor() {
		this.eventLoop = new EventLoop();
		this.webviews = [];

		this.eventLoop.on("window_close_requested", (id) => {
			const webview = this.retrieveWebViewById(id);
			if (!webview) return;
			webview.emit("close_requested");
		});

		this.eventLoop.on("window_focused", (id, focused) => {
			const webview = this.retrieveWebViewById(id);
			if (!webview) return;
			webview.emit("focused", focused);
		});

		this.eventLoop.on("window_moved", (id, position) => {
			const webview = this.retrieveWebViewById(id);
			if (!webview) return;
			webview.emit("moved", position);
		});

		this.eventLoop.on("window_resized", (id, size) => {
			const webview = this.retrieveWebViewById(id);
			if (!webview) return;
			webview.emit("resized", size);
		});
	}

	private generateId() {
		return idIndex++;
	}

	private retrieveWebViewById(id: number) {
		return this.webviews.find((webview) => webview.id === id);
	}

	createWebView(options: WebViewOptions & WindowOptions = {}) {
		const id = this.generateId();
		const webview = new WebView(this.eventLoop, id, options);

		webview.on("destroyed", () => {
			this.webviews = this.webviews.filter((wv) => wv.id !== webview.id);
		});

		return webview;
	}
}
