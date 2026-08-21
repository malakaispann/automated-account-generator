import Bun from "bun";

const OUTPUT_DIR = "./dist";
const MINIFIED_FILE = "minified.js";
const FINAL_FILE = `${OUTPUT_DIR}/script.gs`;

// Build main code
const result = await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: OUTPUT_DIR,
	naming: MINIFIED_FILE,
	minify: true,
	format: "esm",
	target: "browser",
});

if (!result.success) {
	console.error("Initial bundle failed:", result.logs);
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
