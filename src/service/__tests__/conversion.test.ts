import { describe, expect, test } from "bun:test";
import { TurndownConversionService } from "../conversion";

describe("Turndown Conversion Service", () => {
	const service = new TurndownConversionService();

	describe("HTML to Markdown", () => {
		test.each([
			{
				category: "Complex layout",
				html: `
					<h1>Lorem Ipsum Dolor</h1>
					<p>Consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
					<blockquote>
						"Ut enim ad minim veniam, quis nostrud exercitation."
					</blockquote>
					<p>Duis aute irure dolor in reprehenderit in voluptate velit.</p>
				`.trim(),
				expected:
					'Lorem Ipsum Dolor\n=================\n\nConsectetur adipiscing elit, sed do eiusmod tempor incididunt.\n\n> "Ut enim ad minim veniam, quis nostrud exercitation."\n\nDuis aute irure dolor in reprehenderit in voluptate velit.',
			},
			{
				category: "Nested Test Lists",
				html: `
					<p>Excepteur sint occaecat cupidatat non proident:</p>
					<ul>
						<li>Sunt in culpa qui <strong>officia deserunt</strong> mollit.</li>
						<li>Anim id est <code>laborum.method()</code>.</li>
						<li>Ut labore et dolore magna <a href="https://example.org">aliqua</a>.</li>
					</ul>
				`.trim(),
				expected:
					"Excepteur sint occaecat cupidatat non proident:\n\n*   Sunt in culpa qui **officia deserunt** mollit.\n*   Anim id est `laborum.method()`.\n*   Ut labore et dolore magna [aliqua](https://example.org).",
			},
		])("should accurately convert $category", ({ html, expected }) => {
			expect(service.htmlToMarkdown(html)).toBe(expected);
		});
	});
});
