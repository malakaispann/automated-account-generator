import { describe, expect, test } from "bun:test";
import { MetaConfig, PromptConfig } from "../../config";
import { Entry, Response } from "../../models";
import { EntryNotFoundError, EntryValidationError, ExtractionService } from "../extraction";

describe("Extraction service", () => {
	const FIRST_NAME_KEY = "foo";
	const LAST_NAME_KEY = "baz";
	const EMAIL_ADDRESS_KEY = "bar";

	const ORGANIZATION = "/DEADBEEF";
	const DOMAIN = "baddcafe.com";

	const metaConfig = MetaConfig.readonly().parse({
		DOMAIN: DOMAIN,
		DEFAULT_ORGANIZATION: ORGANIZATION,
	});
	const promptConfig = PromptConfig.readonly().parse({
		FIRST_NAME_PROMPT: FIRST_NAME_KEY,
		LAST_NAME_PROMPT: LAST_NAME_KEY,
		EMAIL_ADDRESS_PROMPT: EMAIL_ADDRESS_KEY,
	});

	const extractionService = new ExtractionService(metaConfig, promptConfig);

	describe("Get User", () => {
		test.each([
			[[new Entry(FIRST_NAME_KEY, "a"), new Entry(LAST_NAME_KEY, "b")]],
			[[new Entry(FIRST_NAME_KEY, "a"), new Entry(EMAIL_ADDRESS_KEY, "c")]],
			[[new Entry(LAST_NAME_KEY, "b"), new Entry(EMAIL_ADDRESS_KEY, "c")]],
		])("should throw EntryNotFound error when required entry not found", (entries: Entry[]) => {
			const response = new Response(entries);

			expect(() => extractionService.getUser(response)).toThrow(EntryNotFoundError);
		});

		test.each([
			[
				[
					new Entry(FIRST_NAME_KEY, " "),
					new Entry(LAST_NAME_KEY, "b"),
					new Entry(EMAIL_ADDRESS_KEY, "c"),
				],
			],
			[
				[
					new Entry(FIRST_NAME_KEY, "a"),
					new Entry(LAST_NAME_KEY, " "),
					new Entry(EMAIL_ADDRESS_KEY, "c"),
				],
			],
			[
				[
					new Entry(FIRST_NAME_KEY, "a"),
					new Entry(LAST_NAME_KEY, "b"),
					new Entry(EMAIL_ADDRESS_KEY, "   "),
				],
			],
		])("should throw EntryValidationError error when required entry blank", (entries: Entry[]) => {
			const response = new Response(entries);
			expect(() => extractionService.getUser(response)).toThrow(EntryValidationError);
		});

		test.each([
			[
				[
					new Entry(FIRST_NAME_KEY, [""]),
					new Entry(LAST_NAME_KEY, "b"),
					new Entry(EMAIL_ADDRESS_KEY, "c"),
				],
			],
			[
				[
					new Entry(FIRST_NAME_KEY, "a"),
					new Entry(LAST_NAME_KEY, [[""]]),
					new Entry(EMAIL_ADDRESS_KEY, "c"),
				],
			],
			[
				[
					new Entry(FIRST_NAME_KEY, "a"),
					new Entry(LAST_NAME_KEY, "b"),
					new Entry(EMAIL_ADDRESS_KEY, [""]),
				],
			],
		])("should throw EntryValidationError error when required not string", (entries: Entry[]) => {
			const response = new Response(entries);
			expect(() => extractionService.getUser(response)).toThrow(EntryValidationError);
		});

		test("should create user with expected information", () => {
			const personalEmail = "janedoe99@gmail.com";
			const response = new Response([
				new Entry(FIRST_NAME_KEY, "JANE"),
				new Entry(LAST_NAME_KEY, "doE"),
				new Entry(EMAIL_ADDRESS_KEY, personalEmail),
			]);

			const user = extractionService.getUser(response);
			expect(user.firstName).toBe("Jane");
			expect(user.lastName).toBe("Doe");
			expect(user.primaryEmail).toBe(`j.doe@${DOMAIN}`);
			expect(user.backupEmail).toBe(personalEmail);
			expect(user.organization).toBe(ORGANIZATION);
		});
	});
});
