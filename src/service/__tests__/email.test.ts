import { beforeEach, describe, expect, mock, test } from "bun:test";
import { FeatureConfig, MetaConfig } from "../../config";
import { CreatedUser, type SendEmailPayload } from "../../models";
import type { ConversionService } from "../conversion";
import { ConcreteEmailService, type EmailApi, EmailSendError } from "../email";

describe("Email Service", () => {
	const featureConfig = FeatureConfig.readonly().parse({
		DRY_RUN_SEND_EMAIL: "FALSE",
	});

	const metaConfig = MetaConfig.readonly().parse({
		ADMIN_ALIAS: "admin@steam.com",
		COMPANY_NAME: "Steam",
	});

	const user = CreatedUser.readonly().parse({
		id: "0",
		password: "password123",
		firstName: "foo",
		lastName: "bar",
		primaryEmail: "f.bar@deadbeef.org",
		backupEmail: "foobar@gmail.com",
		organization: "/baddcafe",
	});

	const mockSend = mock();
	const mockGetEmailLimit = mock();
	const mockHtmlToMarkdown = mock();

	const emailApi: EmailApi = {
		send: mockSend,
		getEmailLimit: mockGetEmailLimit,
	};

	const conversionService: ConversionService = {
		htmlToMarkdown: mockHtmlToMarkdown,
	};

	const emailService = new ConcreteEmailService(
		featureConfig,
		metaConfig,
		emailApi,
		conversionService,
	);

	beforeEach(() => {
		mock.clearAllMocks();
	});

	describe("Send Welcome Email", () => {
		test("throws EmailSendError when insufficient email limit", () => {
			mockGetEmailLimit.mockReturnValue(1);
			expect(() => emailService.sendWelcomeEmail(user)).toThrow(EmailSendError);
		});

		test("throws EmailSendError when conversion service throws", () => {
			mockGetEmailLimit.mockReturnValue(100);
			mockHtmlToMarkdown.mockImplementation((_: string) => {
				throw new Error();
			});
			expect(() => emailService.sendWelcomeEmail(user)).toThrow(EmailSendError);
		});

		test("throws EmailSendError when API throws during email send", () => {
			mockGetEmailLimit.mockReturnValue(100);
			mockHtmlToMarkdown.mockReturnValue("foo");
			mockSend.mockImplementation((_: SendEmailPayload) => {
				throw new Error();
			});

			expect(() => emailService.sendWelcomeEmail(user)).toThrow(EmailSendError);
		});

		test("runs no-op when Dry Run True", () => {
			const emailService = new ConcreteEmailService(
				FeatureConfig.readonly().parse({ DRY_RUN_SEND_EMAIL: "TRUE" }),
				metaConfig,
				emailApi,
				conversionService,
			);

			mockGetEmailLimit.mockReturnValue(100);
			mockHtmlToMarkdown.mockReturnValue("foo");

			emailService.sendWelcomeEmail(user);

			expect(mockSend).not.toHaveBeenCalled();
		});

		test("Sends expected emails", () => {
			const firstMessageMd = "message 1 markdown";
			const secondMessageMd = "message 2 markdown";

			mockGetEmailLimit.mockReturnValue(100);
			mockHtmlToMarkdown.mockReturnValueOnce(firstMessageMd);
			mockHtmlToMarkdown.mockReturnValueOnce(secondMessageMd);
			mockSend.mockImplementation((_: SendEmailPayload) => {});

			emailService.sendWelcomeEmail(user);

			expect(mockSend).toHaveBeenCalledTimes(2);
			const firstEmailPayload: SendEmailPayload = mockSend.mock.calls[0]![0];
			const secondEmailPayload: SendEmailPayload = mockSend.mock.calls[1]![0];

			expect(firstEmailPayload).toEqual(
				expect.objectContaining({
					recipient: user.backupEmail,
					subject: `Welcome to ${metaConfig.COMPANY_NAME}`,
					markdownMessage: firstMessageMd,
				}),
			);

			expect(firstEmailPayload.htmlMessage).toSatisfy(
				(str: string) =>
					str.includes("Hello and welcome Foo,") &&
					str.includes("Email:") &&
					str.includes(user.primaryEmail) &&
					str.includes("Temporary Password:") &&
					str.includes(user.password) &&
					str.includes("You will be forced to change this password after your first sign-in"),
			);

			expect(secondEmailPayload).toEqual(
				expect.objectContaining({
					recipient: metaConfig.ADMIN_ALIAS,
					subject: "New Account Creation for Foo Bar",
					markdownMessage: secondMessageMd,
				}),
			);

			expect(secondEmailPayload.htmlMessage).toSatisfy((str: string) =>
				str.includes(
					`A new member account has been created for Foo Bar with the email address ${user.primaryEmail}`,
				),
			);
		});
	});
});
