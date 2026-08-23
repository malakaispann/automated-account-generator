import TurndownService from "turndown";

/**
 * Handles conversion of data formats.
 */
export interface ConversionService {
	/**
	 * Converts to Markdown format.
	 * @param html html string to convert.
	 */
	htmlToMarkdown(html: string): string;
}

export class TurndownConversionService implements ConversionService {
	private readonly turndownService = new TurndownService();

	htmlToMarkdown(html: string): string {
		return this.turndownService.turndown(html);
	}
}
