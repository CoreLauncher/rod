import type { WebViewOptions, WindowOptions } from "../types";

export function transformWebViewOptions(options: WebViewOptions) {
	return {
		autoplay: options.autoplay,
		back_forward_navigation_gestures: options.backForwardNavigationGestures,
		dev_tools: options.devTools,
		hotkeys_zoom: options.hotkeysZoom,
		transparent: options.transparent,
		html: options.html,
		url: options.url,
		incognito: options.incognito,
	};
}

export function transformWindowOptions(options: WindowOptions) {
	return {
		always_on_bottom: options.alwaysOnBottom,
		always_on_top: options.alwaysOnTop,
		closable: options.closable,
		content_protection: options.contentProtection,
		decorations: options.decorations,
		focusable: options.focusable,
		focused: options.focused,
		// fullscreen: options.fullscreen,
		size: options.size,
		minimum_size: options.minimumSize,
		maximum_size: options.maximumSize,
		maximizable: options.maximizable,
		maximized: options.maximized,
		minimizable: options.minimizable,
		position: options.position,
		resizable: options.resizable,
		title: options.title,
		transparent: options.transparent,
		visible: options.visible,
		visible_on_all_workspaces: options.visibleOnAllWorkspaces,
	};
}
