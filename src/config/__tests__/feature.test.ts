import { describe, expect, test } from "bun:test";
import { FeatureConfig } from "../feature";

describe("FeatureConfig", () => {
	test.each(["true", "TRUE"])("should set dry run true", (value: string) => {
		const config = FeatureConfig.readonly().parse({
			DRY_RUN: value,
		});

		expect(config.DRY_RUN).toBeTrue();
	});

	test.each(["false", "FALSE"])("should set dry run false", (value: string) => {
		const config = FeatureConfig.readonly().parse({
			DRY_RUN: value,
		});

		expect(config.DRY_RUN).toBeFalse();
	});

	test("should set defaults when no config provided", () => {
		const config = FeatureConfig.readonly().parse({});
		expect(config.DRY_RUN).toBeFalse();
	});
});
