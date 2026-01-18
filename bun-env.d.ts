declare module "*.dll" {
	const path: `${string}.dll`;
	export = path;
}

declare module "*.so" {
	const path: `${string}.so`;
	export = path;
}
