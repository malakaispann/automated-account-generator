import { describe, expect, mock, test } from "bun:test";
import { FeatureConfig } from "../../config";
import { CreatedUser, User, type UserCreatePayload } from "../../models";
import { type AccountApi, AccountCreationError, AccountService } from "../account";

describe("Account Service", () => {
	const FEATURE_CONFIG = FeatureConfig.readonly().parse({
		DRY_RUN_CREATE_ACCOUNT: "FALSE",
	});

	const USER = User.readonly().parse({
		firstName: "foo",
		lastName: "bar",
		primaryEmail: "f.bar@deadbeef.org",
		backupEmail: "foobar@gmail.com",
		organization: "/baddcafe",
	});

	const THROWING_API: AccountApi = {
		create: (_) => {
			throw new Error();
		},
	};

	test("throws AccountCreationError when API throws", () => {
		const service = new AccountService(THROWING_API, FEATURE_CONFIG);

		expect(() => service.createUser(USER)).toThrow(AccountCreationError);
	});

	test("returns mock Create User when Dry Run True", () => {
		const service = new AccountService(
			THROWING_API,
			FeatureConfig.readonly().parse({ DRY_RUN_CREATE_ACCOUNT: "TRUE" }),
		);
		const createdUser = service.createUser(USER);

		expect(createdUser).toEqual(
			expect.objectContaining({
				...USER,
				id: "0",
			}),
		);
	});

	test("creates user as expected", () => {
		const id = "100";

		const mockCreate = mock((payload: UserCreatePayload) => {
			return CreatedUser.readonly().parse({
				firstName: payload.name.givenName,
				lastName: payload.name.familyName,
				primaryEmail: payload.primaryEmail,
				backupEmail: payload.recoveryEmail,
				password: payload.password,
				organization: payload.orgUnitPath,
				id: id,
			});
		});
		const copyingApi: AccountApi = {
			create: mockCreate,
		};

		const service = new AccountService(copyingApi, FEATURE_CONFIG);
		const createdUser = service.createUser(USER);

		expect(mockCreate).toHaveBeenCalledTimes(1);
		const mockCreatePayload = mockCreate.mock.calls[0]![0];

		expect(createdUser).toEqual(
			expect.objectContaining({
				...USER,
				id: id,
				password: mockCreatePayload.password,
			}),
		);
		expect(mockCreatePayload.changePasswordAtNextLogin).toBeTrue();
	});
});
