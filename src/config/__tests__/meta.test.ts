import { describe, expect, test } from "bun:test";
import { MetaConfig } from "../meta";

describe("MetaConfig", () => {
	test("should set values", () => {
		const subOrg = "/foo";
		const domain = "baz.qux";
		const adminAlias = `admin@${domain}`;
		const companyName = "The Cheesecake Factory";
		const senderDisplayName = "Cheesecake Times";

		const config = MetaConfig.readonly().parse({
			ADMIN_EMAIL_ALIAS: adminAlias,
			DEFAULT_ACCOUNT_SUB_ORGANIZATION: subOrg,
			SENDER_DISPLAY_NAME: senderDisplayName,
			ORGANIZATION_DOMAIN: domain,
			ORGANIZATION_NAME: companyName,
		});

		expect(config.ADMIN_EMAIL_ALIAS).toBe(adminAlias);
		expect(config.DEFAULT_ACCOUNT_SUB_ORGANIZATION).toBe(subOrg);
		expect(config.SENDER_DISPLAY_NAME).toBe(senderDisplayName);
		expect(config.ORGANIZATION_DOMAIN).toBe(domain);
		expect(config.ORGANIZATION_NAME).toBe(companyName);
	});

	test("should set defaults when no config provided", () => {
		const config = MetaConfig.readonly().parse({});

		expect(config.ADMIN_EMAIL_ALIAS).toBe("admin@gmail.com");
		expect(config.DEFAULT_ACCOUNT_SUB_ORGANIZATION).toBe("/");
		expect(config.SENDER_DISPLAY_NAME).toBe("XYZ Account Generator");
		expect(config.ORGANIZATION_DOMAIN).toBe("gmail.com");
		expect(config.ORGANIZATION_NAME).toBe("XYZ");
	});
});
