export interface ImmutableMap<K, V> extends ReadonlyMap<K, V> {
	/**
	 * Returns non-null value associated with key.
	 *
	 * @param key key to find
	 * @param throwableCallback error generator if key not found or value nullish.
	 */
	getOrThrow<E extends Error>(key: K, throwableCallback: () => E): V;
}

export class ThrowableMap<K, V> extends Map<K, V> implements ImmutableMap<K, V> {
	getOrThrow<E extends Error>(key: K, throwableCallback: () => E): V {
		const value = this.get(key);

		if (!value) {
			throw throwableCallback();
		}

		return value;
	}
}
