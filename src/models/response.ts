import { camelCase } from "lodash-es";

export type Answer = string | string[] | string[][];

export class Entry {
	public readonly key: string;

	constructor(
		public readonly prompt: string,
		public readonly answer: Answer,
	) {
		this.key = camelCase(prompt);
	}
}

export class Response {
	public readonly entryMap: Map<string, Entry>;

	constructor(public readonly entries: Array<Entry>) {
		this.entryMap = new Map(entries.map((entry) => [entry.key, entry]));
	}
}
