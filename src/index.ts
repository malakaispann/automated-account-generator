import Logger from "js-logger";
import { extractAppConfig } from "./config";
import { Entry, Response } from "./models";
import { ExtractionService } from "./service";

// Configure logging
Logger.useDefaults({
	defaultLevel: Logger.INFO,
});
const logger = Logger.get("automated-email-generation");

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

	logger.debug("Creating Services");
	const extractionService = new ExtractionService(appConfig.meta, appConfig.prompt);

	// Convert payload to domain object
	const entries = rawResponse
		.getItemResponses()
		.filter((response) => response !== null && response !== undefined)
		.map((response) => new Entry(response.getItem().getTitle(), response.getResponse()));
	const response = new Response(entries);

	// Process
	logger.debug("Form payload:", JSON.stringify(response, null, 2));
	const user = extractionService.getUser(response);
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
