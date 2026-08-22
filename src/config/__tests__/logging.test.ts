import { describe, expect, test } from "bun:test";
import { LoggingConfig } from "../logging";

describe("LoggingConfig", () => {
	test.each(["debug", "DEBUG"])("should set logging level to debug", (value: string) => {
		const config = LoggingConfig.readonly().parse({
			LOGGING_LEVEL: value,
		});

		expect(config.LOGGING_LEVEL).toBe("debug");
	});

	test.each(["error", "ERROR"])("should set logging level to error", (value: string) => {
		const config = LoggingConfig.readonly().parse({
			LOGGING_LEVEL: value,
		});

		expect(config.LOGGING_LEVEL).toBe("error");
	});

	test.each(["info", "INFO"])("should set logging level to info", (value: string) => {
		const config = LoggingConfig.readonly().parse({
			LOGGING_LEVEL: value,
		});

		expect(config.LOGGING_LEVEL).toBe("info");
	});

	test.each(["trace", "TRACE"])("should set logging level to trace", (value: string) => {
		const config = LoggingConfig.readonly().parse({
			LOGGING_LEVEL: value,
		});

		expect(config.LOGGING_LEVEL).toBe("trace");
	});

	test.each(["warn", "WARN"])("should set logging level to warn", (value: string) => {
		const config = LoggingConfig.readonly().parse({
			LOGGING_LEVEL: value,
		});

		expect(config.LOGGING_LEVEL).toBe("warn");
	});

	test("should set defaults when no config provided", () => {
		const config = LoggingConfig.readonly().parse({});

		expect(config.LOGGING_LEVEL).toBe("info");
	});
});
