import { z } from "zod/v4";

export const MetaConfig = z.object({
	DEFAULT_ORGANIZATION: z.string().default("/"),
	DOMAIN: z.string().default("gmail.com"),
});

export type MetaConfig = z.infer<typeof MetaConfig>;
