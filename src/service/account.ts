import Logger from "js-logger";
import type { FeatureConfig } from "../config";
import { CreatedUser, type User, UserCreatePayload } from "../models";

/**
 * Indicates an issue has occurred while attempting to manage accounts.
 */
export class AccountError extends Error {}

/**
 * Indicates account creation failed.
 */
export class AccountCreationError extends AccountError {}

/**
 * API responsible for direct communication with account server.
 */
export interface AccountApi {
	/**
	 * Creates user returning status of create operation.
	 * @param payload payload containing user information.
	 */
	create(payload: UserCreatePayload): CreatedUser;
}

/**
 * Handles account management.
 */
export interface AccountService {
	/**
	 * Creates new user
	 * @param user details of the user
	 * @returns newly created user account info.
	 */
	createUser(user: User): CreatedUser;
}

export class ConcreteAccountService implements AccountService {
	private readonly logger = Logger.get("account-service");

	constructor(
		private readonly featureConfig: FeatureConfig,
		private readonly accountApi: AccountApi,
	) {}

	createUser(user: User): CreatedUser {
		this.logger.info(`Attempting to create account for ${user.firstName} ${user.lastName}`);

		const temporaryPassword = this.generateTemporaryPassword();
		const createUserPayload = UserCreatePayload.readonly().parse({
			name: {
				givenName: user.firstName,
				familyName: user.lastName,
			},
			primaryEmail: user.primaryEmail,
			password: temporaryPassword,
			recoveryEmail: user.backupEmail,
			orgUnitPath: user.organization,
		});

		// Handle dry run by returning dummy
		if (this.featureConfig.DRY_RUN_CREATE_ACCOUNT) {
			this.logger.warn("Dry Run configuration enabled; Skipping real account generation logic");

			const created = CreatedUser.readonly().parse({
				...user,
				password: temporaryPassword,
				id: "0",
			});
			this.logger.debug(
				"Would have created user with the following information:",
				JSON.stringify(created, null, 2),
			);

			return created;
		}

		try {
			const created = this.accountApi.create(createUserPayload);
			this.logger.info(`Successfully created account with ID: ${created.id}`);
			return created;
		} catch (err) {
			this.logger.error(err);
			throw new AccountCreationError("Unable to create account.");
		}
	}

	private generateTemporaryPassword(): string {
		return `tEmP!${Math.random().toString(36).substring(2, 14)}`;
	}
}
