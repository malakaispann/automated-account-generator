import { z } from "zod/v4";

export const MetaConfig = z.object({
	DEFAULT_ORGANIZATION: z.string().default("/"),
});

export type MetaConfig = z.infer<typeof MetaConfig>;
