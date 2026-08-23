// @ts-expect-error
import createTextVersion from "textversionjs";

/**
 * Handles conversion of data formats.
 */
export interface ConversionService {
	/**
	 * Converts to Plain text format.
	 * @param html html string to convert.
	 */
	htmlToText(html: string): string;
}

export class ConcreteConversionService implements ConversionService {
	htmlToText(html: string): string {
		return createTextVersion(html) as string;
	}
}
