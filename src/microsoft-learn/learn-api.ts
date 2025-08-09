import { LearnRequestBuilder } from './learn-request-builder';
import {
	CatalogResponseSchema,
	type CatalogResponse,
	type ModuleRecord,
	type LearningPathRecord,
} from './responses';

/**
 * Thin API client around the Microsoft Learn Catalog using the fluent request builder
 * and Zod schemas for runtime validation.
 */
export class LearnApi {
	constructor() {}

	/**
	 * Create a new request builder (helper).
	 */
	builder() {
		return new LearnRequestBuilder();
	}

	/**
	 * Fetch the catalog using a request builder. You can pass either an existing
	 * LearnRequestBuilder or a configure function that receives a new builder.
	 */
	async fetchCatalog(
		builderOrConfigure?: LearnRequestBuilder | ((b: LearnRequestBuilder) => LearnRequestBuilder)
	): Promise<CatalogResponse> {
		const builder =
			typeof builderOrConfigure === 'function'
				? builderOrConfigure(this.builder())
				: builderOrConfigure ?? this.builder();

		const url = builder.build();
		const res = await fetch(url);
		if (!res.ok) {
			const body = await safeText(res);
			throw new Error(`Learn API request failed: ${res.status} ${res.statusText}\n${body ?? ''}`);
		}
		const json = await res.json();
		return CatalogResponseSchema.parse(json);
	}

	/** Convenience: fetch just modules (with optional extra filters via configure). */
	async getModules(
		configure?: (b: LearnRequestBuilder) => LearnRequestBuilder
	): Promise<ModuleRecord[]> {
		const data = await this.fetchCatalog((b) => (configure ? configure(b.types('modules')) : b.types('modules')));
		return data.modules ?? [];
	}

	/** Convenience: fetch just learning paths (with optional extra filters via configure). */
	async getLearningPaths(
		configure?: (b: LearnRequestBuilder) => LearnRequestBuilder
	): Promise<LearningPathRecord[]> {
		const data = await this.fetchCatalog((b) => (configure ? configure(b.types('learningPaths')) : b.types('learningPaths')));
		return data.learningPaths ?? [];
	}

}

async function safeText(res: Response) {
	try {
		return await res.text();
	} catch {
		return undefined;
	}
}

