import { describe, expect, test } from "bun:test";
import { MetaConfig } from "../meta";

describe("MetaConfig", () => {
	test("should set values", () => {
		const org = "/foo";
		const domain = "baz.qux";

		const config = MetaConfig.readonly().parse({
			DEFAULT_ORGANIZATION: org,
			DOMAIN: domain,
		});

		expect(config.DEFAULT_ORGANIZATION).toBe(org);
		expect(config.DOMAIN).toBe(domain);
	});

	test("should set defaults when no config provided", () => {
		const config = MetaConfig.readonly().parse({});

		expect(config.DEFAULT_ORGANIZATION).toBe("/");
		expect(config.DOMAIN).toBe("gmail.com");
	});
});
