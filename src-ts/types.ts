export type WebViewOptions = {
	autoplay?: boolean;
	backForwardNavigationGestures?: boolean;
	devTools?: boolean;
	hotkeysZoom?: boolean;
	transparent?: boolean;
	html?: string;
	url?: string;
	incognito?: boolean;
};

export type WindowOptions = {
	alwaysOnBottom?: boolean;
	alwaysOnTop?: boolean;
	closable?: boolean;
	contentProtection?: boolean;
	decorations?: boolean;
	focusable?: boolean;
	focused?: boolean;
	// fullscreen?: boolean;
	size?: Size;
	minimumSize?: Size;
	maximumSize?: Size;
	maximizable?: boolean;
	maximized?: boolean;
	minimizable?: boolean;
	position?: Position;
	resizable?: boolean;
	title?: string;
	transparent?: boolean;
	visible?: boolean;
	visibleOnAllWorkspaces?: boolean;
};

export type Size = {
	width: number;
	height: number;
};

export type Position = {
	x: number;
	y: number;
};

export enum ProgressState {
	Normal = 0,
	Intermediate = 1,
	Paused = 2,
	Error = 3,
	None = 4,
}
