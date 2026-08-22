import z from "zod/v4";

export const User = z.object({
	firstName: z.string().nonempty(),
	lastName: z.string().nonempty(),
	primaryEmail: z.string().nonempty(),
	backupEmail: z.string().nonempty(),
	organization: z.string().nonempty(),
});

export type User = z.infer<typeof User>;
