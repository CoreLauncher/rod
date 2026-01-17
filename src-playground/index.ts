import Rod from "../src-ts";

const rod = new Rod();
const webview = rod.createWebView({
	title: "CoreLauncher - Rod WebView Playground",
	url: "https://tauri.app",
	focused: false,
	// decorations:false,
	size: {
		width: 600,
		height: 300,
	},
	minimumSize: {
		width: 1200,
		height: 800,
	},
});

const tray = rod.createTray({ iconPath: "./icon.ico", title: "hi" });
tray.on("click", () => {
	console.log("click");
	webview.setVisible(!webview.isVisible);
});
