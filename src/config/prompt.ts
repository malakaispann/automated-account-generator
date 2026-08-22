import { z } from "zod/v4";

export const PromptConfig = z.object({
	FIRST_NAME_PROMPT: z.string().default("First Name"),
	LAST_NAME_PROMPT: z.string().default("Last Name"),
	EMAIL_ADDRESS_PROMPT: z.string().default("Email"),
});

export type PromptConfig = z.infer<typeof PromptConfig>;
