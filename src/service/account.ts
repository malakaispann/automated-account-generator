import z from "zod/v4";
import type { User } from "../models/user";

export const UserCreatePayload = z.object({
	name: z.object({
		givenName: z.string().nonempty(),
		familyName: z.string().nonempty(),
	}),
	primaryEmail: z.string().nonempty(),
	password: z.string().nonempty(),
	recoveryEmail: z.string().nonempty(),
	orgUnitPath: z.string().nonempty(),
});

export type UserCreatePayload = z.infer<typeof UserCreatePayload>;

export interface AccountService {
	create(User: User): void;
}
