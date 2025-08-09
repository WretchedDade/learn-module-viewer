/**
 * https://learn.microsoft.com/api/catalog/
 * 
 * Name	Value	Type	Required	Example
locale	A single, valid locale code from the supported list of locales. The returned metadata will be in the requested locale if available. If this parameter isn't supplied, the en-us response will be returned.	string	No	?locale=en-us
type	A comma-separated list of one or more of the top-level content or taxonomies objects we currently provide in the response to return. Supported values are: modules, units, learningPaths, appliedSkills, certifications, mergedCertifications, exams, courses, levels, roles, products, subjects.	string	No	?type=modules,learningPaths
uid	A comma-separated list of one or more valid content unique IDs (uid) from the available content types. Note: uids are case-sensitive.	string	No	?uid=learn.azure.intro-to-azure-fundamentals
last_modified	An operator and datetime to filter by the last modified date of objects. Operator includes lt (less than), lte (less than or equal to), eq (equal to), gt (greater than), gte (greater than or equal to). When you use this parameter, the operator will default to gte if not specified.	string	No	?last_modified=gte 2022-01-01
popularity	An operator and value to filter by the popularity value (in a range of 0-1) of objects. Operator includes lt (less than), lte (less than or equal to), eq (equal to), gt (greater than), gte (greater than or equal to). When you use this parameter, the operator will default to gte if not specified.	string	No	?popularity=gte 0.5
level	A comma-separated list of one or more of the levels we currently have available (full list is in the levels object of the API response).	string	No	?level=beginner
role	A comma-separated list of one or more of the roles we currently have available (full list is in the roles object of the API response).	string	No	?role=developer
product	A comma-separated list of one or more of the roles we currently have available (full list is in the products object of the API response). The API doesn't support product hierarchy, so add every product to the list you want to include in your query.	string	No	?product=azure
subject	A comma-separated list of one or more of the roles we currently have available (full list is in the subjects object of the API response). The API doesn't support subject hierarchy, so add every subject to the list you want to include in your query.	string	No	?subject=cloud-computing
 */

/**
 * A small fluent builder for constructing Microsoft Learn Catalog API requests.
 * Docs: https://learn.microsoft.com/api/catalog/
 *
 * Example:
 * const url = new LearnRequestBuilder()
 *   .locale('en-us')
 *   .types('modules', 'learningPaths')
 *   .roles('developer')
 *   .lastModified('gte', '2024-01-01')
 *   .build();
 */
export class LearnRequestBuilder {
	private static readonly BASE_URL = 'https://learn.microsoft.com/api/catalog/';

	/** Internal map of raw param values (already serialized as strings). */
	private params: Record<string, string> = {};

	/** Utility to add/update a simple param */
	private set(name: string, value: string | undefined | null) {
		if (value == null || value === '') {
			delete this.params[name];
		} else {
			this.params[name] = value;
		}
	}

	/** Utility to add a comma-separated list param (deduped) */
	private setList(name: string, values: (string | undefined | null)[]) {
		const list = Array.from(
			new Set(
				values
					.flatMap(v => (v ? v.split(',') : []))
					.map(v => v.trim())
					.filter(Boolean)
			)
		);
		this.set(name, list.length ? list.join(',') : undefined);
	}

	/** Locale code (e.g. en-us). */
	locale(locale: string) { this.set('locale', locale.toLowerCase()); return this; }

	/** Content types to return (modules, units, learningPaths, appliedSkills, certifications, mergedCertifications, exams, courses, levels, roles, products, subjects). */
	types(...types: string[]) { this.setList('type', types); return this; }

	/** One or more unique content IDs (uids). */
	uids(...uids: string[]) { this.setList('uid', uids); return this; }

	/** Filter by levels. */
	levels(...levels: string[]) { this.setList('level', levels); return this; }

	/** Filter by roles. */
	roles(...roles: string[]) { this.setList('role', roles); return this; }

	/** Filter by products. */
	products(...products: string[]) { this.setList('product', products); return this; }

	/** Filter by subjects. */
	subjects(...subjects: string[]) { this.setList('subject', subjects); return this; }

	/**
	 * last_modified filter. Accepts either (operator, date) OR a single date (defaults to gte).
	 * Dates can be Date objects or ISO/date strings (YYYY-MM-DD recommended).
	 */
	lastModified(operatorOrDate: Operator | Date | string, dateMaybe?: Date | string) {
		const serialized = this.serializeOperatorAndValue(operatorOrDate, dateMaybe);
		this.set('last_modified', serialized);
		return this;
	}

	/**
	 * popularity filter. Accepts either (operator, value) OR a single numeric value (defaults to gte).
	 * Popularity value expected 0-1 range.
	 */
	popularity(operatorOrValue: Operator | number | string, valueMaybe?: number | string) {
		const serialized = this.serializeOperatorAndValue(operatorOrValue, valueMaybe);
		this.set('popularity', serialized);
		return this;
	}

	/** Clear all parameters */
	reset() { this.params = {}; return this; }

	/** Build and return the final URL string. */
	build(): string { return this.toURL().toString(); }

	/** Build and return a URL object (convenient for further manipulation). */
	toURL(): URL {
		const url = new URL(LearnRequestBuilder.BASE_URL);
		Object.entries(this.params).forEach(([k, v]) => {
			// Preserve space between operator and value (encoded as %20) per API examples.
			url.searchParams.set(k, v);
		});
		return url;
	}

	/** Return a shallow copy of current param map (for introspection/testing). */
	snapshot(): Record<string, string> { return { ...this.params }; }

	/** Human-readable representation */
	toString() { return this.build(); }

	/** Helper to serialize (operator, value) patterns. */
	private serializeOperatorAndValue(opOrValue: Operator | Date | string | number, valueMaybe?: Date | string | number) {
		const operators: Operator[] = ['lt', 'lte', 'eq', 'gt', 'gte'];
		let operator: Operator = 'gte';
		let value: Date | string | number | undefined;

		if (valueMaybe == null) {
			// Single argument: treat as value, default operator gte
			value = opOrValue as any;
		} else {
			if (operators.includes(opOrValue as Operator)) {
				operator = opOrValue as Operator;
				value = valueMaybe;
			} else {
				// If first arg isn't an operator, assume both are part of value? Fallback: treat first as value.
				value = valueMaybe; // Still take the second as value to avoid silent mistakes
			}
		}
		if (value instanceof Date) {
			// Use date part only when time is midnight else full ISO
			const iso = value.toISOString();
			if (iso.endsWith('T00:00:00.000Z')) {
				value = iso.slice(0, 10); // YYYY-MM-DD
			} else {
				value = iso;
			}
		}
		return `${operator} ${String(value)}`.trim();
	}
}

export type Operator = 'lt' | 'lte' | 'eq' | 'gt' | 'gte';
