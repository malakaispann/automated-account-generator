import { z } from "zod/v4";

export const FeatureConfig = z.object({
	DRY_RUN: z
		.string()
		.default("false")
		.transform((val) => val.toLowerCase().trim())
		.pipe(z.enum(["true", "false"]))
		.transform((val) => val === "true"),
});

export type FeatureConfig = z.infer<typeof FeatureConfig>;
