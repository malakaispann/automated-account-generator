import { camelCase } from "lodash-es";
import { type ImmutableMap, ThrowableMap } from "../util";

export type Answer = string | string[] | string[][];

export class Entry {
	public readonly key: string;
	public readonly answer: Answer;

	/**
	 * Creates an Entry.
	 *
	 * @param prompt the prompt to generate a key from.
	 */
	constructor(prompt: string);

	/**
	 * Creates an Entry.
	 *
	 * @param prompt the prompt to generate a key from.
	 * @param answer: the answer to the prompt. Defaults to an empty string.
	 */
	constructor(prompt: string, answer: Answer);
	constructor(prompt: string, answer?: Answer) {
		this.key = camelCase(prompt);
		this.answer = answer ?? "";
	}
}

export class Response {
	public readonly entryMap: ImmutableMap<string, Entry>;

	/**
	 * Creates a full response.
	 *
	 * The keys from the entries will be used to form the entryMap.
	 * In the case of multiple entries with duplicate keys, only the last
	 * will be used.
	 *
	 * @param entries all entries in the response.
	 */
	constructor(public readonly entries: Array<Entry>) {
		this.entryMap = new ThrowableMap(entries.map((entry) => [entry.key, entry]));
	}
}
