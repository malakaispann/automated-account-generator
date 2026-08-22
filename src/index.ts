import Logger from "js-logger";
import { Entry, Response } from "./models/response";

// Configure logging
Logger.useDefaults({
	defaultLevel: Logger.INFO,
});
const logger = Logger.get("automated-email-generation");

function handleFormSubmit(context: GoogleAppsScript.Events.FormsOnFormSubmit) {
	// Convert payload to domain object
	const rawResponse = context.response;
	logger.info(`New submission detected: ${rawResponse.getId()}. Attempting to parse`);

	const entries = rawResponse
		.getItemResponses()
		.map((response) => new Entry(response.getItem().getTitle(), response.getResponse()));
	const response = new Response(entries);

	// Process
	logger.info("Form payload processed:", JSON.stringify(response, null, 2));
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

(globalThis as any)[handleFormSubmit.name] = handleFormSubmit;
(globalThis as any)["registerSubmissionHandler"] = registerSubmissionHandler; // This is required to register the method in the UI
