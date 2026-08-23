import { describe, expect, test } from "bun:test";
import { MetaConfig } from "../meta";

describe("MetaConfig", () => {
	test("should set values", () => {
		const org = "/foo";
		const domain = "baz.qux";
		const adminAlias = `admin@${domain}`;
		const companyName = "The Cheesecake Factory";

		const config = MetaConfig.readonly().parse({
			ADMIN_EMAIL_ALIAS: adminAlias,
			ORGANIZATION_DOMAIN: domain,
			ORGANIZATION_NAME: companyName,
			DEFAULT_ACCOUNT_SUB_ORGANIZATION: org,
		});

		expect(config.ADMIN_EMAIL_ALIAS).toBe(adminAlias);
		expect(config.ORGANIZATION_DOMAIN).toBe(domain);
		expect(config.ORGANIZATION_NAME).toBe(companyName);
		expect(config.DEFAULT_ACCOUNT_SUB_ORGANIZATION).toBe(org);
	});

	test("should set defaults when no config provided", () => {
		const config = MetaConfig.readonly().parse({});

		expect(config.ADMIN_EMAIL_ALIAS).toBe("admin@gmail.com");
		expect(config.ORGANIZATION_NAME).toBe("XYZ");
		expect(config.ORGANIZATION_DOMAIN).toBe("gmail.com");
		expect(config.DEFAULT_ACCOUNT_SUB_ORGANIZATION).toBe("/");
	});
});
