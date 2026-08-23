import Bun from "bun";
import * as esbuild from "esbuild";

const OUTPUT_DIR = "./dist";
const MINIFIED_FILE = "minified.js";
const FINAL_FILE = `${OUTPUT_DIR}/script.gs`;

// Build main code
try {
	await esbuild.build({
		entryPoints: ["./src/index.ts"],
		bundle: true,
		minify: true,
		format: "iife",
		outfile: `${OUTPUT_DIR}/${MINIFIED_FILE}`,
		target: "es2020",
	});
} catch (error) {
	console.error("Initial esbuild bundle failed.", error);
	process.exit(1);
}

// Create unmangled wrapper for minified code.
const minifiedFile = Bun.file(`${OUTPUT_DIR}/${MINIFIED_FILE}`);
const minifiedCode = await minifiedFile.text();

const googleUiWrapper = `
// Exposes an un-mangled function literal directly to the Google editor interface
function runSetup() {
  globalThis["registerSubmissionHandler"]();
}
`;

// 4. Overwrite the file with the bundle + the wrapper combined
await Bun.write(FINAL_FILE, `${minifiedCode}\n${googleUiWrapper}`);

console.log(`Successfully bundled in ${FINAL_FILE}`);
