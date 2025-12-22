import { dlopen, FFIType, suffix } from "bun:ffi";
import { join } from "path";

const path = join(import.meta.dir, "..", "target", "debug", `rod.${suffix}`);

const {
	symbols: { rod_test },
} = dlopen(path, {
	rod_test: {
		args: [],
		returns: FFIType.void,
	},
});

export { rod_test };
