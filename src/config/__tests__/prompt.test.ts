import { describe, expect, test } from "bun:test";
import { PromptConfig } from "../prompt";

describe("PromptConfig", () => {
	test("should extract prompt values", () => {
		const firstNamePrompt = "First Name of Member";
		const lastNamePrompt = "Last Name of Member";
		const emailAddressPrompt = "Email Address Prompt";
		const config = PromptConfig.readonly().parse({
			FIRST_NAME_PROMPT: firstNamePrompt,
			LAST_NAME_PROMPT: lastNamePrompt,
			EMAIL_ADDRESS_PROMPT: emailAddressPrompt,
		});

		expect(config.FIRST_NAME_PROMPT).toBe(firstNamePrompt);
		expect(config.LAST_NAME_PROMPT).toBe(lastNamePrompt);
		expect(config.EMAIL_ADDRESS_PROMPT).toBe(emailAddressPrompt);
	});

	test("should set defaults when no config provided", () => {
		const config = PromptConfig.readonly().parse({});

		expect(config.FIRST_NAME_PROMPT).toBe("First Name");
		expect(config.LAST_NAME_PROMPT).toBe("Last Name");
		expect(config.EMAIL_ADDRESS_PROMPT).toBe("Email");
	});
});
