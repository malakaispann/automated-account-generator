import Logger from "js-logger";
import { extractAppConfig } from "./config";
import {
	CreatedUser,
	Entry,
	Response,
	type SendEmailPayload,
	type UserCreatePayload,
} from "./models";
import {
	ConcreteAccountService,
	ConcreteConversionService,
	ConcreteEmailService,
	ConcreteExtractionService,
} from "./service";

// Configure logging
Logger.useDefaults({
	defaultLevel: Logger.INFO,
});
const logger = Logger.get("automated-account-generator");

/**
 * Entry point for form submissions.
 */
function handleFormSubmit(context: GoogleAppsScript.Events.FormsOnFormSubmit) {
	const rawResponse = context.response;
	logger.info(`Processing new submission: ${rawResponse.getId()}.`);

	// Configure application
	logger.info("Extracting app configuration");
	const appConfig = extractAppConfig(PropertiesService.getScriptProperties().getProperties());
	const logLevel = ((level) => {
		switch (level) {
			case "debug":
				return Logger.DEBUG;
			case "info":
				return Logger.DEBUG;
			case "warn":
				return Logger.WARN;
			case "error":
				return Logger.ERROR;
			case "trace":
				return Logger.TRACE;
		}
	})(appConfig.logging.LOGGING_LEVEL);
	Logger.setLevel(logLevel);

	logger.trace("Application configuration", JSON.stringify(appConfig, null, 2));

	logger.debug("Creating Services");
	const accountService = new ConcreteAccountService(appConfig.feature, {
		create: (payload: UserCreatePayload) => {
			const newUser = AdminDirectory!.Users.insert(payload);
			return CreatedUser.readonly().parse({
				id: newUser.id,
				firstName: newUser.name?.givenName,
				lastName: newUser.name?.familyName,
				primaryEmail: newUser.primaryEmail,
				backupEmail: newUser.recoveryEmail,
				organization: newUser.orgUnitPath,
				password: newUser.password,
			});
		},
	});
	const conversionService = new ConcreteConversionService();
	const emailService = new ConcreteEmailService(
		appConfig.feature,
		appConfig.meta,
		{
			getEmailLimit: () => MailApp.getRemainingDailyQuota(),
			send: (payload: SendEmailPayload) => {
				MailApp.sendEmail(payload.recipient, payload.subject, payload.markdownMessage, {
					htmlBody: payload.htmlMessage,
					name: payload.senderName,
				});
			},
		},
		conversionService,
	);
	const extractionService = new ConcreteExtractionService(appConfig.meta, appConfig.prompt);

	// Convert payload to domain object
	const entries = rawResponse
		.getItemResponses()
		.filter((response) => response !== null && response !== undefined)
		.map((response) => new Entry(response.getItem().getTitle(), response.getResponse()));
	const response = new Response(entries);

	// Process
	logger.debug("Form payload:", JSON.stringify(response, null, 2));
	const user = extractionService.getUser(response);
	const createdUser = accountService.createUser(user);
	emailService.sendWelcomeEmail(createdUser);

	logger.info("Successfully processed submission.");
}

/**
 * Registers submission callback.
 */
function registerSubmissionHandler() {
	logger.info("Registering submission handler.");
	ScriptApp.newTrigger(handleFormSubmit.name)
		.forForm(FormApp.getActiveForm())
		.onFormSubmit()
		.create();
	logger.info("Successfully registered handler.");
}

/**
 * Handle registration of entry functions to global namespace.
 *
 * This is required for GAS to find the functions during execution.
 * Some functions named may also need to be hardcoded to avoid mangling
 * in the minimized output.
 */
(globalThis as any)[handleFormSubmit.name] = handleFormSubmit;
// biome-ignore lint/complexity/useLiteralKeys: Required to register method with UI
(globalThis as any)["registerSubmissionHandler"] = registerSubmissionHandler;
