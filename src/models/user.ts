import z from "zod/v4";

export const User = z.object({
	firstName: z.string().nonempty(),
	lastName: z.string().nonempty(),
	primaryEmail: z.string().nonempty(),
	backupEmail: z.string().nonempty(),
	organization: z.string().nonempty(),
});

export type User = z.infer<typeof User>;

export const CreatedUser = User.extend({
	id: z.string().nonempty(),
	password: z.string().nonempty(),
});

export type CreatedUser = z.infer<typeof CreatedUser>;

export const UserCreatePayload = z.object({
	name: z.object({
		givenName: z.string().nonempty(),
		familyName: z.string().nonempty(),
	}),
	primaryEmail: z.string().nonempty(),
	password: z.string().nonempty(),
	recoveryEmail: z.string().nonempty(),
	orgUnitPath: z.string().nonempty(),
	changePasswordAtNextLogin: z.literal(true).default(true),
});

export type UserCreatePayload = z.infer<typeof UserCreatePayload>;
