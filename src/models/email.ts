import z from "zod/v4";

export const SendEmailPayload = z.object({
	recipient: z.string().nonempty(),
	subject: z.string().nonempty(),
	htmlMessage: z.string().nonempty(),
	markdownMessage: z.string().nonempty(),
	senderName: z.string().nonempty(),
});

export type SendEmailPayload = z.infer<typeof SendEmailPayload>;
