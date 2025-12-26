import type { Pointer } from "bun:ffi";
import { TypedEmitter } from "tiny-typed-emitter";
import {
	rod_window_create,
	rod_window_destroy,
	rod_window_get_always_on_top,
	rod_window_get_closable,
	rod_window_get_decorated,
	rod_window_get_focused,
	rod_window_get_maximizable,
	rod_window_get_maximized,
	rod_window_get_minimizable,
	rod_window_get_minimized,
	rod_window_get_position,
	rod_window_get_resizable,
	rod_window_get_size,
	rod_window_get_title,
	rod_window_get_visible,
	rod_window_set_always_on_bottom,
	rod_window_set_always_on_top,
	rod_window_set_closable,
	rod_window_set_content_protection,
	rod_window_set_decorations,
	rod_window_set_focus,
	rod_window_set_focusable,
	rod_window_set_fullscreen,
	rod_window_set_ignore_cursor_events,
	rod_window_set_maximizable,
	rod_window_set_maximized,
	rod_window_set_maximum_size,
	rod_window_set_minimizable,
	rod_window_set_minimized,
	rod_window_set_minimum_size,
	rod_window_set_position,
	rod_window_set_progress_bar,
	rod_window_set_resizable,
	rod_window_set_size,
	rod_window_set_title,
	rod_window_set_visible,
	rod_window_set_visible_on_all_workspaces,
	rod_window_start_drag,
} from "../ffi";
import type { Position, ProgressState, Size, WindowOptions } from "../types";
import { transformWindowOptions } from "../utilities/options";
import { encodeString } from "../utilities/strings";

interface WindowEvents {
	close_requested: () => void;
	focused: (focused: boolean) => void;
	moved: (position: Position) => void;
	resized: (size: Size) => void;
	destroyed: () => void;
}

export default class Window extends TypedEmitter<WindowEvents> {
	id: number;
	protected windowPtr: Pointer;
	constructor(eventLoop: Pointer, id: number, options: WindowOptions) {
		super();

		this.id = id;

		const windowPtr = rod_window_create(
			eventLoop,
			id,
			encodeString(JSON.stringify(transformWindowOptions(options))),
		);
		if (!windowPtr) throw new Error("Failed to create Window");
		this.windowPtr = windowPtr;
	}

	get title() {
		const title = rod_window_get_title(this.windowPtr);
		return title.toString();
	}

	get size() {
		const rawSize = rod_window_get_size(this.windowPtr);
		return JSON.parse(rawSize.toString()) as Size;
	}

	get position() {
		const rawPosition = rod_window_get_position(this.windowPtr);
		return JSON.parse(rawPosition.toString()) as Position;
	}

	get isAlwaysOnTop() {
		return rod_window_get_always_on_top(this.windowPtr);
	}
	get isClosable() {
		return rod_window_get_closable(this.windowPtr);
	}
	get isDecorated() {
		return rod_window_get_decorated(this.windowPtr);
	}
	get isFocused() {
		return rod_window_get_focused(this.windowPtr);
	}
	get isMaximizable() {
		return rod_window_get_maximizable(this.windowPtr);
	}
	get isMaximized() {
		return rod_window_get_maximized(this.windowPtr);
	}
	get isMinimizable() {
		return rod_window_get_minimizable(this.windowPtr);
	}
	get isMinimized() {
		return rod_window_get_minimized(this.windowPtr);
	}
	get isResizable() {
		return rod_window_get_resizable(this.windowPtr);
	}
	get isVisible() {
		return rod_window_get_visible(this.windowPtr);
	}

	setAlwaysOnBottom(alwaysOnBottom: boolean) {
		rod_window_set_always_on_bottom(this.windowPtr, alwaysOnBottom);
	}

	setAlwaysOnTop(alwaysOnTop: boolean) {
		rod_window_set_always_on_top(this.windowPtr, alwaysOnTop);
	}

	setClosable(closable: boolean) {
		rod_window_set_closable(this.windowPtr, closable);
	}

	setContentProtection(contentProtection: boolean) {
		rod_window_set_content_protection(this.windowPtr, contentProtection);
	}

	setDecorations(decorations: boolean) {
		rod_window_set_decorations(this.windowPtr, decorations);
	}

	setFocus() {
		rod_window_set_focus(this.windowPtr);
	}

	setFocusable(focusable: boolean) {
		rod_window_set_focusable(this.windowPtr, focusable);
	}

	setFullscreen(fullscreen: boolean) {
		rod_window_set_fullscreen(this.windowPtr, fullscreen);
	}

	setIgnoreCursorEvents(ignore: boolean) {
		rod_window_set_ignore_cursor_events(this.windowPtr, ignore);
	}

	setSize(size: Size) {
		rod_window_set_size(this.windowPtr, encodeString(JSON.stringify(size)));
	}

	setMaximumSize(size: Size | null) {
		if (size === null) {
			rod_window_set_maximum_size(this.windowPtr, encodeString(""));
		} else {
			rod_window_set_maximum_size(
				this.windowPtr,
				encodeString(JSON.stringify(size)),
			);
		}
	}

	setMaximizable(maximizable: boolean) {
		rod_window_set_maximizable(this.windowPtr, maximizable);
	}

	setMaximized(maximized: boolean) {
		rod_window_set_maximized(this.windowPtr, maximized);
	}

	setMinimumSize(size: Size | null) {
		if (size === null) {
			rod_window_set_minimum_size(this.windowPtr, encodeString(""));
		} else {
			rod_window_set_minimum_size(
				this.windowPtr,
				encodeString(JSON.stringify(size)),
			);
		}
	}

	setMinimizable(minimizable: boolean) {
		rod_window_set_minimizable(this.windowPtr, minimizable);
	}

	setMinimized(minimized: boolean) {
		rod_window_set_minimized(this.windowPtr, minimized);
	}

	setPosition(position: Position) {
		rod_window_set_position(
			this.windowPtr,
			encodeString(JSON.stringify(position)),
		);
	}

	setProgressBar(state: ProgressState, progress: number) {
		const payload = { state: state as number, progress };
		rod_window_set_progress_bar(
			this.windowPtr,
			encodeString(JSON.stringify(payload)),
		);
	}

	setResizable(resizable: boolean) {
		rod_window_set_resizable(this.windowPtr, resizable);
	}

	setTitle(title: string) {
		rod_window_set_title(this.windowPtr, encodeString(title));
	}

	setVisible(visible: boolean) {
		rod_window_set_visible(this.windowPtr, visible);
	}

	setVisibleOnAllWorkspaces(visible: boolean) {
		rod_window_set_visible_on_all_workspaces(this.windowPtr, visible);
	}

	startDrag() {
		rod_window_start_drag(this.windowPtr);
	}

	destroy() {
		if (!this.windowPtr) return;

		this.emit("destroyed");

		rod_window_destroy(this.windowPtr);
		this.windowPtr = null as unknown as Pointer;
	}
}
