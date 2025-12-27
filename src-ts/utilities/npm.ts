import { existsSync } from "node:fs";
import { join } from "node:path";

export function isPackaged() {
	const modules = join(import.meta.dir, "..", "..", "node_modules");
	return !existsSync(modules);
}
