import { describe, expect, test } from "bun:test";
import { MetaConfig } from "../meta";

describe("MetaConfig", () => {
	test("should set values", () => {
		const org = "/foo";
		const domain = "baz.qux";
		const adminAlias = `admin@${domain}`;
		const companyName = "The Cheesecake Factory";

		const config = MetaConfig.readonly().parse({
			ADMIN_ALIAS: adminAlias,
			COMPANY_NAME: companyName,
			DEFAULT_ORGANIZATION: org,
			DOMAIN: domain,
		});

		expect(config.ADMIN_ALIAS).toBe(adminAlias);
		expect(config.COMPANY_NAME).toBe(companyName);
		expect(config.DEFAULT_ORGANIZATION).toBe(org);
		expect(config.DOMAIN).toBe(domain);
	});

	test("should set defaults when no config provided", () => {
		const config = MetaConfig.readonly().parse({});

		expect(config.ADMIN_ALIAS).toBe("admin@gmail.com");
		expect(config.COMPANY_NAME).toBe("XYZ");
		expect(config.DEFAULT_ORGANIZATION).toBe("/");
		expect(config.DOMAIN).toBe("gmail.com");
	});
});
