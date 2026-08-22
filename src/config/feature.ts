import { z } from "zod/v4";

const booleanExtractor = z
	.string()
	.default("true")
	.transform((val) => val.toLowerCase().trim())
	.pipe(z.enum(["true", "false"]))
	.transform((val) => val === "true");

export const FeatureConfig = z.object({
	DRY_RUN_CREATE_ACCOUNT: booleanExtractor,
	DRY_RUN_SEND_EMAIL: booleanExtractor,
});

export type FeatureConfig = z.infer<typeof FeatureConfig>;
