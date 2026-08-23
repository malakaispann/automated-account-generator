import { z } from "zod/v4";

export const MetaConfig = z.object({
	ADMIN_EMAIL_ALIAS: z.string().nonempty().default("admin@gmail.com"),
	DEFAULT_ACCOUNT_SUB_ORGANIZATION: z.string().nonempty().default("/"),
	ORGANIZATION_DOMAIN: z.string().nonempty().default("gmail.com"),
	ORGANIZATION_NAME: z.string().nonempty().default("XYZ"),
});

export type MetaConfig = z.infer<typeof MetaConfig>;
