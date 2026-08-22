import { describe, expect, test } from "bun:test";
import { MetaConfig } from "../meta";

describe("MetaConfig", () => {
	test("should set default organization", () => {
		const org = "/foo";
		const config = MetaConfig.readonly().parse({
			DEFAULT_ORGANIZATION: org,
		});

		expect(config.DEFAULT_ORGANIZATION).toBe(org);
	});

	test("should set defaults when no config provided", () => {
		const config = MetaConfig.readonly().parse({});

		expect(config.DEFAULT_ORGANIZATION).toBe("/");
	});
});
