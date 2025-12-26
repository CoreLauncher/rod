import Rod from "../src-ts";

const rod = new Rod();
const webview = rod.createWebView({
	title: "CoreLauncher - Rod WebView Playground",
	url: "https://example.com",
	focused: false,
	size: {
		width: 400,
		height: 300,
	},
});

console.log(webview.size);
