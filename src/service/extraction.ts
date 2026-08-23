import Logger from "js-logger";
import { capitalize, isEmpty } from "lodash-es";
import type { MetaConfig, PromptConfig } from "../config";
import { type Response, User } from "../models";
import { type Answer, Entry } from "../models/response";

/**
 * Indicates an issue occurred while attempting to extract information
 * from input.
 */
export class ExtractionError extends Error {}

/**
 * Indicates an expected entry was not found in a Response.
 */
export class EntryNotFoundError extends ExtractionError {
	constructor(expected: Entry) {
		super(`Failed to find expected entry with key [${expected.key}]`);
	}
}

/**
 * Indicates an entry's answer was not as expected.
 */
export class EntryValidationError extends ExtractionError {}

/**
 * Handles validation and extraction of information from responses.
 */
export interface ExtractionService {
	/**
	 * Creates user from response
	 *
	 * @param response response containing user information
	 */
	getUser(response: Response): User;
}

export class ConcreteExtractionService implements ExtractionService {
	private readonly expectedEntries: {
		firstName: Entry;
		lastName: Entry;
		emailAddress: Entry;
	};

	private readonly logger = Logger.get("extraction-service");

	constructor(
		private readonly metaConfig: MetaConfig,
		promptConfig: PromptConfig,
	) {
		this.expectedEntries = {
			firstName: new Entry(promptConfig.FIRST_NAME_PROMPT),
			lastName: new Entry(promptConfig.LAST_NAME_PROMPT),
			emailAddress: new Entry(promptConfig.EMAIL_ADDRESS_PROMPT),
		};
	}

	getUser(response: Response): User {
		this.logger.info("Extracting user information from response");

		// Extract and validate.
		const firstName = this.validateAnswerIsNonBlankString(
			response.entryMap.getOrThrow(this.expectedEntries.firstName.key, () => {
				throw new EntryNotFoundError(this.expectedEntries.firstName);
			}).answer,
			"first name",
		);

		const lastName = this.validateAnswerIsNonBlankString(
			response.entryMap.getOrThrow(this.expectedEntries.lastName.key, () => {
				throw new EntryNotFoundError(this.expectedEntries.lastName);
			}).answer,
			"last name",
		);

		const personalEmailAddress = this.validateAnswerIsNonBlankString(
			response.entryMap.getOrThrow(this.expectedEntries.emailAddress.key, () => {
				throw new EntryNotFoundError(this.expectedEntries.emailAddress);
			}).answer,
			"personal email address",
		);

		// Construct remaining information.
		const primaryEmail = `${firstName.toLowerCase().charAt(0)}.${lastName.toLowerCase()}@${this.metaConfig.ORGANIZATION_DOMAIN.toLowerCase()}`;

		const user = User.readonly().parse({
			firstName: capitalize(firstName),
			lastName: capitalize(lastName),
			primaryEmail: primaryEmail,
			backupEmail: personalEmailAddress,
			organization: this.metaConfig.DEFAULT_ACCOUNT_SUB_ORGANIZATION,
		});

		this.logger.info("Successfully extracted information.");
		this.logger.debug("User Info:", JSON.stringify(user, null, 2));

		return user;
	}

	/**
	 * Normalizes and validates a string-like answer.
	 *
	 * @param answer answer to validate
	 * @param entryAlias common name of what the answer represents.
	 * @returns the normalized answer
	 */
	private validateAnswerIsNonBlankString(answer: Answer, entryAlias: string): string {
		const answerType = typeof answer;

		if (answerType !== "string") {
			throw new EntryValidationError(
				`Expected ${entryAlias} to be a string, but it was a ${answerType}`,
			);
		}

		answer = (answer as string).trim();
		if (isEmpty(answer)) {
			throw new EntryValidationError(
				`Answer for ${entryAlias} must have at least one valid character.`,
			);
		}

		return answer;
	}
}
