import Logger from "js-logger";
import { capitalize } from "lodash-es";
import type { FeatureConfig, MetaConfig } from "../config";
import { type CreatedUser, SendEmailPayload } from "../models";
import type { ConversionService } from "./conversion";

/**
 * Indicates an issue has occurred while attempting to manage emails.
 */
export class EmailError extends Error {}

/**
 * Indicates email failed to send.
 */
export class EmailSendError extends EmailError {}

/**
 * API responsible for direct communication with email server.
 */
export interface EmailApi {
	/**
	 * Sends email
	 * @param payload payload containing email information.
	 */
	send(payload: SendEmailPayload): void;

	/**
	 * Returns the number of emails that can be sent
	 */
	getEmailLimit(): number;
}

/**
 * Handles email management.
 */
export interface EmailService {
	/**
	 * Sends welcome email to new user.
	 *
	 * Also sends notification email to admin alias with the address of the new user.
	 *
	 * @param user information of the new user.
	 */
	sendWelcomeEmail(user: CreatedUser): void;
}

export class ConcreteEmailService implements EmailService {
	private readonly logger = Logger.get("email-service");

	constructor(
		private readonly featureConfig: FeatureConfig,
		private readonly metaConfig: MetaConfig,
		private readonly emailApi: EmailApi,
		private readonly conversionService: ConversionService,
	) {}

	sendWelcomeEmail(user: CreatedUser): void {
		this.logger.info("Attempting to send welcome email and notify admin alias");

		if (this.emailApi.getEmailLimit() < 2) {
			throw new EmailSendError("Cannot send at least 2 emails. Aborting operation.");
		}

		this.sendEmail(
			user.backupEmail,
			`Welcome to ${this.metaConfig.COMPANY_NAME}`,
			`
            <p>Hello and welcome ${capitalize(user.firstName)},</p>
            <p>A company account has been created for you; see the details below:</p>
            <p>
                <strong>Email:</strong> ${user.primaryEmail}<br>
                <strong>Temporary Password:</strong> <code>${user.password}</code>
            </p>
            <p><strong>Security Notice:</strong> You will be forced to change this password after your first sign-in.</p>
        `,
		);

		const fullName = `${capitalize(user.firstName)} ${capitalize(user.lastName)}`;
		this.sendEmail(
			this.metaConfig.ADMIN_ALIAS,
			`New Account Creation for ${fullName}`,
			`
            <p>Good day,</p>
            <p>A new member account has been created for ${fullName} with the email address ${user.primaryEmail}</p>
            <p>Please add the member to all applicable communication channels.</p>
            `,
		);
	}

	/**
	 * Sends email using provided information.
	 *
	 * Handles legacy email clients by sending message in Markdown format as backup.
	 *
	 * @param recipient address to send to
	 * @param subject subject of email to send
	 * @param htmlBody the body of email to send in HTML format
	 */
	private sendEmail(recipient: string, subject: string, htmlBody: string): void {
		this.logger.info(
			`Preparing to send email with subject "${subject}" to recipient [${recipient}]`,
		);

		let markdownBody: string;

		// Necessary for outdated or "secure" email clients that don't allow html. :)
		try {
			markdownBody = this.conversionService.htmlToMarkdown(htmlBody);
		} catch (err) {
			this.logger.error(err);
			throw new EmailSendError("Failed to convert message to markdown (backup) format.");
		}

		const payload = SendEmailPayload.readonly().parse({
			recipient: recipient,
			subject: subject,
			htmlMessage: htmlBody,
			markdownMessage: markdownBody,
		});

		// Handle dry run scenario
		if (this.featureConfig.DRY_RUN_SEND_EMAIL) {
			this.logger.warn("Dry Run configuration enabled; Not sending an actual email");
			this.logger.debug(
				"Would have sent email with the following information:",
				JSON.stringify(payload, null, 2),
			);
			return;
		}

		try {
			this.emailApi.send(payload);
		} catch (err) {
			this.logger.error(err);
			throw new EmailSendError("Failed to send email.");
		}

		this.logger.info("Successfully sent email");
	}
}
