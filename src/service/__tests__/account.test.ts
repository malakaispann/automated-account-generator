import { beforeEach, describe, expect, mock, test } from "bun:test";
import { FeatureConfig } from "../../config";
import { CreatedUser, User, type UserCreatePayload } from "../../models";
import { type AccountApi, AccountCreationError, ConcreteAccountService } from "../account";

describe("Concrete Account Service", () => {
	const featureConfig = FeatureConfig.readonly().parse({
		DRY_RUN_CREATE_ACCOUNT: "FALSE",
	});

	const user = User.readonly().parse({
		firstName: "foo",
		lastName: "bar",
		primaryEmail: "f.bar@deadbeef.org",
		backupEmail: "foobar@gmail.com",
		organization: "/baddcafe",
	});

	const mockCreate = mock();

	const accountApi: AccountApi = {
		create: mockCreate,
	};

	const service = new ConcreteAccountService(featureConfig, accountApi);

	beforeEach(() => {
		mock.clearAllMocks();
	});

	describe("Create User", () => {
		test("throws AccountCreationError when API throws", () => {
			mockCreate.mockImplementation((_: UserCreatePayload) => {
				throw new Error();
			});

			expect(() => service.createUser(user)).toThrow(AccountCreationError);
		});

		test("returns cloned user details when Dry Run True", () => {
			const service = new ConcreteAccountService(
				FeatureConfig.readonly().parse({ DRY_RUN_CREATE_ACCOUNT: "TRUE" }),
				accountApi,
			);
			const createdUser = service.createUser(user);

			expect(mockCreate).not.toBeCalled();
			expect(createdUser).toEqual(
				expect.objectContaining({
					...user,
					id: "0",
				}),
			);
		});

		test("creates user as expected", () => {
			const id = "100";

			mockCreate.mockImplementation((payload: UserCreatePayload) => {
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
			const createdUser = service.createUser(user);

			expect(mockCreate).toHaveBeenCalledTimes(1);
			const mockCreatePayload: UserCreatePayload = mockCreate.mock.calls[0]![0];

			expect(createdUser).toEqual(
				expect.objectContaining({
					...user,
					id: id,
					password: mockCreatePayload.password,
				}),
			);
			expect(mockCreatePayload.changePasswordAtNextLogin).toBeTrue();
		});
	});
});
