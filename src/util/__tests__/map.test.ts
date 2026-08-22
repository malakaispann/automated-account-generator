import { describe, expect, test } from "bun:test";
import { ThrowableMap } from "../map";

describe("ThrowableMap", () => {
	class TestError extends Error {}

	test("Should throw error when key not in map", () => {
		const map = new ThrowableMap();
		expect(() => map.getOrThrow("foo", () => new TestError())).toThrow(TestError);
	});

	test.each([null, undefined])("Should throw error when value nullish", (value) => {
		const key = "foo";
		const map = new ThrowableMap([[key, value]]);

		expect(() => map.getOrThrow(key, () => new TestError())).toThrow(TestError);
	});

	test("Should return value when non-null", () => {
		const key = "foo";
		const value = "bar";
		const map = new ThrowableMap([[key, value]]);

		expect(map.getOrThrow(key, () => new TestError())).toBe(value);
	});
});
