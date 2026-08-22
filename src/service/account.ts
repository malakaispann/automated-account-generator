import type { User } from "../models/user";

export interface AccountService {
	create(User: User): void;
}
