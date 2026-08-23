import { z } from "zod/v4";

const DEFAULT_SENDER_DISPLAY_NAME = "__Default"; // should be pretty unique

export const MetaConfig = z
	.object({
		ADMIN_EMAIL_ALIAS: z.string().nonempty().default("admin@gmail.com"),
		DEFAULT_ACCOUNT_SUB_ORGANIZATION: z.string().nonempty().default("/"),
		SENDER_DISPLAY_NAME: z.string().nonempty().default(DEFAULT_SENDER_DISPLAY_NAME),
		ORGANIZATION_DOMAIN: z.string().nonempty().default("gmail.com"),
		ORGANIZATION_NAME: z.string().nonempty().default("XYZ"),
	})
	.transform((config) => {
		// Generate true default sender display name using org name
		const senderDisplayName =
			config.SENDER_DISPLAY_NAME === DEFAULT_SENDER_DISPLAY_NAME
				? `${config.ORGANIZATION_NAME} Account Generator`
				: config.SENDER_DISPLAY_NAME;

		return {
			...config,
			SENDER_DISPLAY_NAME: senderDisplayName,
		};
	});

export type MetaConfig = z.infer<typeof MetaConfig>;
