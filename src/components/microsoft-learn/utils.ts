export type TagSource = Partial<{
	levels: string[]
	roles: string[]
	products: string[]
	subjects: string[]
}>

/**
 * Convert an unknown value to a non-empty string, otherwise undefined.
 */
export function asString(v: unknown): string | undefined {
	return typeof v === 'string' && v.trim().length > 0 ? v : undefined
}

/**
 * Extract up to `max` tags from the given source, preserving a stable order.
 * Duplicates and non-string values are ignored; default order: levels → roles → products → subjects.
 */
export function extractTags(src: TagSource, max = 3, order: Array<keyof TagSource> = ['levels', 'roles', 'products', 'subjects']): string[] {
	const out: string[] = []
	const seen = new Set<string>()
	for (const key of order) {
		const arr = src[key]
		if (!arr) continue
		for (const v of arr) {
			if (typeof v !== 'string') continue
			const t = v.trim()
			if (t.length === 0) continue
			if (seen.has(t)) continue
			out.push(t)
			seen.add(t)
			if (out.length >= max) return out
		}
	}
	return out
}
