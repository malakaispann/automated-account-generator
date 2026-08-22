import { z } from "zod/v4";

export const LoggingConfig = z.object({
	LOGGING_LEVEL: z.preprocess(
		(val) => (typeof val === "string" ? val.toLowerCase() : val),
		z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
	),
});

export type LoggingConfig = z.infer<typeof LoggingConfig>;
