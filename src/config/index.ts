import { FeatureConfig } from "./feature";
import { LoggingConfig } from "./logging";
import { MetaConfig } from "./meta";
import { PromptConfig } from "./prompt";

export type AppConfig = {
	readonly feature: FeatureConfig;
	readonly logging: LoggingConfig;
	readonly meta: MetaConfig;
	readonly prompt: PromptConfig;
};

/**
 * Extracts application configuration from environment.
 *
 * @param environ the environment to use
 */
export function extractAppConfig(environ: Record<string, string>): AppConfig {
	return {
		feature: FeatureConfig.readonly().parse(environ),
		logging: LoggingConfig.readonly().parse(environ),
		meta: MetaConfig.readonly().parse(environ),
		prompt: PromptConfig.readonly().parse(environ),
	};
}

export { FeatureConfig, LoggingConfig };
