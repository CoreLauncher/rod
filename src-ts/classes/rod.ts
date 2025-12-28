import type { TrayOptions, WebViewOptions, WindowOptions } from "../types";
import EventLoop from "./eventloop";
import Tray from "./tray";
import WebView from "./webview";

let idIndex = 1;

export default class Rod {
	eventLoop: EventLoop;
	private webviews: WebView[];
	private trays: Tray[];
	constructor() {
		this.eventLoop = new EventLoop();
		this.webviews = [];
		this.trays = [];

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

		this.eventLoop.on("tray_clicked", (id) => {
			const tray = this.trays.find((t) => t.id === id);
			if (!tray) return;
			tray.emit("click");
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
		this.webviews.push(webview);

		webview.on("destroyed", () => {
			this.webviews = this.webviews.filter((wv) => wv.id !== webview.id);
		});

		return webview;
	}

	createTray(options: TrayOptions) {
		const id = this.generateId();
		const tray = new Tray(id, options);
		this.trays.push(tray);

		tray.on("destroyed", () => {
			this.trays = this.trays.filter((t) => t.id !== tray.id);
		});

		return tray;
	}

	destroy() {
		this.webviews.forEach((webview) => {
			webview.destroy();
		});
		this.trays.forEach((tray) => {
			tray.destroy();
		});

		this.eventLoop.destroy();
	}
}
