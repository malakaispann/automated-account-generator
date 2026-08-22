import { describe, expect, test } from "bun:test";
import { FeatureConfig } from "../feature";

describe("FeatureConfig", () => {
	test.each(["true", "TRUE"])("should set dry run values true", (value: string) => {
		const config = FeatureConfig.readonly().parse({
			DRY_RUN_CREATE_ACCOUNT: value,
			DRY_RUN_SEND_EMAIL: value,
		});

		expect(config.DRY_RUN_CREATE_ACCOUNT).toBeTrue();
		expect(config.DRY_RUN_SEND_EMAIL).toBeTrue();
	});

	test.each(["false", "FALSE"])("should set dry run values false", (value: string) => {
		const config = FeatureConfig.readonly().parse({
			DRY_RUN_CREATE_ACCOUNT: value,
			DRY_RUN_SEND_EMAIL: value,
		});

		expect(config.DRY_RUN_CREATE_ACCOUNT).toBeFalse();
		expect(config.DRY_RUN_SEND_EMAIL).toBeFalse();
	});

	test("should set defaults when no config provided", () => {
		const config = FeatureConfig.readonly().parse({});
		expect(config.DRY_RUN_CREATE_ACCOUNT).toBeTrue();
		expect(config.DRY_RUN_SEND_EMAIL).toBeTrue();
	});
});
