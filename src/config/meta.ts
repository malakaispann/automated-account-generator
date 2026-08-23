import { z } from "zod/v4";

export const MetaConfig = z.object({
	ADMIN_ALIAS: z.string().nonempty().default("admin@gmail.com"),
	COMPANY_NAME: z.string().nonempty().default("XYZ"),
	DEFAULT_ORGANIZATION: z.string().nonempty().default("/"),
	DOMAIN: z.string().nonempty().default("gmail.com"),
});

export type MetaConfig = z.infer<typeof MetaConfig>;
