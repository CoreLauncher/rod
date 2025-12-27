import { dlopen, FFIType } from "bun:ffi";
import { join } from "node:path";

let library: { default: string };
if (process.env.WEBVIEW_PATH) {
	library = { default: join(".", process.env.WEBVIEW_PATH) };
} else if (process.platform === "win32") {
	library = await import("../target/release/rod.dll");
} else {
	throw new Error("Unsupported platform");
}

const {
	symbols: {
		// event loop
		rod_event_loop_create,
		rod_event_loop_destroy,

		// event loop actions
		rod_event_loop_poll,

		// window
		rod_window_create,
		rod_window_destroy,

		// window getters
		rod_window_get_title,
		rod_window_get_size,
		rod_window_get_position,
		rod_window_get_always_on_top,
		rod_window_get_closable,
		rod_window_get_decorated,
		rod_window_get_focused,
		rod_window_get_maximizable,
		rod_window_get_maximized,
		rod_window_get_minimizable,
		rod_window_get_minimized,
		rod_window_get_resizable,
		rod_window_get_visible,

		// window setters
		rod_window_set_always_on_bottom,
		rod_window_set_always_on_top,
		rod_window_set_closable,
		rod_window_set_content_protection,
		rod_window_set_decorations,
		rod_window_set_focus,
		rod_window_set_focusable,
		rod_window_set_fullscreen,
		rod_window_set_ignore_cursor_events,
		rod_window_set_size,
		rod_window_set_maximum_size,
		rod_window_set_maximizable,
		rod_window_set_maximized,
		rod_window_set_minimum_size,
		rod_window_set_minimizable,
		rod_window_set_minimized,
		rod_window_set_position,
		rod_window_set_progress_bar,
		rod_window_set_resizable,
		rod_window_set_title,
		rod_window_set_visible,
		rod_window_set_visible_on_all_workspaces,

		// window actions
		rod_window_start_drag,

		// webcontext
		rod_webcontext_create,
		rod_webcontext_destroy,

		// webview
		rod_webview_create,
		rod_webview_destroy,

		// webview getters
		rod_webview_get_url,
		rod_webview_is_devtools_open,

		// webview setters
		rod_webview_set_url,
		rod_webview_set_html,
		rod_webview_zoom,

		// webview actions
		rod_webview_open_devtools,
		rod_webview_close_devtools,
		rod_webview_reload,
		rod_webview_clear_all_browsing_data,
	},
} = dlopen(library.default, {
	// event loop
	rod_event_loop_create: {
		args: [],
		returns: FFIType.ptr,
	},
	rod_event_loop_destroy: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},
	rod_event_loop_poll: {
		args: [FFIType.ptr, FFIType.function],
		returns: FFIType.void,
	},

	// window
	rod_window_create: {
		args: [FFIType.ptr, FFIType.u16, FFIType.cstring],
		returns: FFIType.ptr,
	},
	rod_window_destroy: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},

	// window getters
	rod_window_get_title: {
		args: [FFIType.ptr],
		returns: FFIType.cstring,
	},
	rod_window_get_size: {
		args: [FFIType.ptr],
		returns: FFIType.cstring,
	},
	rod_window_get_position: {
		args: [FFIType.ptr],
		returns: FFIType.cstring,
	},
	rod_window_get_always_on_top: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_window_get_closable: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_window_get_decorated: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_window_get_focused: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_window_get_maximizable: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_window_get_maximized: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_window_get_minimizable: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_window_get_minimized: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_window_get_resizable: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_window_get_visible: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},

	// window setters
	rod_window_set_always_on_bottom: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_always_on_top: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_closable: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_content_protection: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_decorations: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_focus: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},
	rod_window_set_focusable: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_fullscreen: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_ignore_cursor_events: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_size: {
		args: [FFIType.ptr, FFIType.cstring],
		returns: FFIType.void,
	},
	rod_window_set_maximum_size: {
		args: [FFIType.ptr, FFIType.cstring],
		returns: FFIType.void,
	},
	rod_window_set_maximizable: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_maximized: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_minimum_size: {
		args: [FFIType.ptr, FFIType.cstring],
		returns: FFIType.void,
	},
	rod_window_set_minimizable: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_minimized: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_position: {
		args: [FFIType.ptr, FFIType.cstring],
		returns: FFIType.void,
	},
	rod_window_set_progress_bar: {
		args: [FFIType.ptr, FFIType.cstring],
		returns: FFIType.void,
	},
	rod_window_set_resizable: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_title: {
		args: [FFIType.ptr, FFIType.cstring],
		returns: FFIType.void,
	},
	rod_window_set_visible: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},
	rod_window_set_visible_on_all_workspaces: {
		args: [FFIType.ptr, FFIType.bool],
		returns: FFIType.void,
	},

	// window actions
	rod_window_start_drag: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},

	// webcontext
	rod_webcontext_create: {
		args: [FFIType.ptr, FFIType.cstring],
		returns: FFIType.ptr,
	},
	rod_webcontext_destroy: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},

	// webview
	rod_webview_create: {
		args: [FFIType.ptr, FFIType.ptr, FFIType.cstring],
		returns: FFIType.ptr,
	},
	rod_webview_destroy: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},
	rod_webview_set_url: {
		args: [FFIType.ptr, FFIType.cstring],
		returns: FFIType.void,
	},
	rod_webview_get_url: {
		args: [FFIType.ptr],
		returns: FFIType.cstring,
	},
	rod_webview_open_devtools: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},
	rod_webview_close_devtools: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},
	rod_webview_is_devtools_open: {
		args: [FFIType.ptr],
		returns: FFIType.bool,
	},
	rod_webview_zoom: {
		args: [FFIType.ptr, FFIType.f64],
		returns: FFIType.void,
	},
	rod_webview_reload: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},
	rod_webview_set_html: {
		args: [FFIType.ptr, FFIType.cstring],
		returns: FFIType.void,
	},
	rod_webview_clear_all_browsing_data: {
		args: [FFIType.ptr],
		returns: FFIType.void,
	},
});

export {
	// event loop
	rod_event_loop_create,
	rod_event_loop_destroy,
	// event loop actions
	rod_event_loop_poll,
	// window
	rod_window_create,
	rod_window_destroy,
	// window getters
	rod_window_get_title,
	rod_window_get_size,
	rod_window_get_position,
	rod_window_get_always_on_top,
	rod_window_get_closable,
	rod_window_get_decorated,
	rod_window_get_focused,
	rod_window_get_maximizable,
	rod_window_get_maximized,
	rod_window_get_minimizable,
	rod_window_get_minimized,
	rod_window_get_resizable,
	rod_window_get_visible,
	// window setters
	rod_window_set_always_on_bottom,
	rod_window_set_always_on_top,
	rod_window_set_closable,
	rod_window_set_content_protection,
	rod_window_set_decorations,
	rod_window_set_focus,
	rod_window_set_focusable,
	rod_window_set_fullscreen,
	rod_window_set_ignore_cursor_events,
	rod_window_set_size,
	rod_window_set_maximum_size,
	rod_window_set_maximizable,
	rod_window_set_maximized,
	rod_window_set_minimum_size,
	rod_window_set_minimizable,
	rod_window_set_minimized,
	rod_window_set_position,
	rod_window_set_progress_bar,
	rod_window_set_resizable,
	rod_window_set_title,
	rod_window_set_visible,
	rod_window_set_visible_on_all_workspaces,
	// window actions
	rod_window_start_drag,
	// webcontext
	rod_webcontext_create,
	rod_webcontext_destroy,
	// webview
	rod_webview_create,
	rod_webview_destroy,
	// webview getters
	rod_webview_get_url,
	rod_webview_is_devtools_open,
	// webview setters
	rod_webview_set_url,
	rod_webview_set_html,
	rod_webview_zoom,
	// webview actions
	rod_webview_open_devtools,
	rod_webview_close_devtools,
	rod_webview_reload,
	rod_webview_clear_all_browsing_data,
};
