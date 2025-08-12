/**
 * Zod Schemas & inferred types for Microsoft Learn Catalog API.
 * Only Zod is used for type definitions so runtime validation is possible.
 */
import { z } from 'zod';

export const ISODateStringSchema = z.string(); // keep simple (could refine with regex)
// Popularity may be absent; keep optional at the property usage site by wrapping in .optional
export const PopularityScoreSchema = z.number().min(0).max(1);

export const RatingSchema = z
	.object({
		count: z.number().optional(),
		average: z.number().optional(),
	})
	.catchall(z.unknown());
export type Rating = z.infer<typeof RatingSchema>;

export const StudyGuideReferenceSchema = z
	.object({
		uid: z.string().optional(),
		type: z.string().optional(),
	})
	.catchall(z.unknown());
export type StudyGuideReference = z.infer<typeof StudyGuideReferenceSchema>;

export const ProviderInfoSchema = z
	.object({
		type: z.string().optional(),
		url: z.string().optional().nullable(),
	})
	.catchall(z.unknown());
export type ProviderInfo = z.infer<typeof ProviderInfoSchema>;

export const CareerPathInfoSchema = z.object({}).catchall(z.unknown());
export type CareerPathInfo = z.infer<typeof CareerPathInfoSchema>;

const BaseLearningRecordSchema = z
	.object({
		uid: z.string(),
	type: z.string().optional(),
		title: z.string().optional(),
		locale: z.string().optional().nullable(),
		last_modified: ISODateStringSchema.optional().nullable(),
	})
	.catchall(z.unknown());

export const ModuleRecordSchema = BaseLearningRecordSchema.extend({
	type: z.literal('module'),
	summary: z.string().optional(),
	levels: z.array(z.string()).optional().default([]),
	roles: z.array(z.string()).optional().default([]),
	products: z.array(z.string()).optional().default([]),
	subjects: z.array(z.string()).optional().default([]),
	title: z.string(),
	duration_in_minutes: z.number().int().nonnegative().optional(),
	rating: RatingSchema.optional(),
	popularity: PopularityScoreSchema.optional(),
	icon_url: z.string().optional().nullable(),
	social_image_url: z.string().optional().nullable(),
	url: z.string(),
	firstUnitUrl: z.string().optional().nullable(),
	units: z.array(z.string()).optional().default([]),
	number_of_children: z.number().int().nonnegative().optional(),
});
export type ModuleRecord = z.infer<typeof ModuleRecordSchema>;

export const UnitRecordSchema = BaseLearningRecordSchema.extend({
	type: z.literal('unit'),
	title: z.string(),
	duration_in_minutes: z.number().int().nonnegative().optional(),
});
export type UnitRecord = z.infer<typeof UnitRecordSchema>;

export const LearningPathRecordSchema = BaseLearningRecordSchema.extend({
	type: z.literal('learningPath'),
	summary: z.string().optional(),
	levels: z.array(z.string()).optional().default([]),
	roles: z.array(z.string()).optional().default([]),
	products: z.array(z.string()).optional().default([]),
	subjects: z.array(z.string()).optional().default([]),
	title: z.string(),
	duration_in_minutes: z.number().int().nonnegative().optional(),
	rating: RatingSchema.optional(),
	popularity: PopularityScoreSchema.optional(),
	icon_url: z.string().optional().nullable(),
	social_image_url: z.string().optional().nullable(),
	url: z.string(),
	firstModuleUrl: z.string().optional().nullable(),
	modules: z.array(z.string()).optional().default([]),
	number_of_children: z.number().int().nonnegative().optional(),
});
export type LearningPathRecord = z.infer<typeof LearningPathRecordSchema>;

export const AppliedSkillRecordSchema = BaseLearningRecordSchema.extend({
	uid: z.string(),
	title: z.string(),
	summary: z.string().optional(),
	url: z.string(),
	icon_url: z.string().optional().nullable(),
	levels: z.array(z.string()).optional().default([]),
	roles: z.array(z.string()).optional().default([]),
	products: z.array(z.string()).optional().default([]),
	subjects: z.array(z.string()).optional().default([]),
	study_guide: z.array(StudyGuideReferenceSchema).optional().default([]),
	last_modified: ISODateStringSchema.optional().nullable(),
});
export type AppliedSkillRecord = z.infer<typeof AppliedSkillRecordSchema>;

export const CertificationTypeSchema = z.union([
	z.literal('fundamentals'),
	z.literal('mce'),
	z.literal('mcsa'),
	z.literal('mcsd'),
	z.literal('mcse'),
	z.literal('mos'),
	z.literal('mta'),
	z.literal('role-based'),
	z.literal('specialty'),
	z.string(), // future values
]);
export type CertificationType = z.infer<typeof CertificationTypeSchema>;

export const MergedCertificationRecordSchema = BaseLearningRecordSchema.extend({
	type: z.literal('cert'),
	title: z.string(),
	summary: z.string().optional(),
	url: z.string(),
	icon_url: z.string().optional().nullable(),
	last_modified: ISODateStringSchema.optional().nullable(),
	certification_type: CertificationTypeSchema.optional(),
	products: z.array(z.string()).optional().default([]),
	levels: z.array(z.string()).optional().default([]),
	roles: z.array(z.string()).optional().default([]),
	subjects: z.array(z.string()).optional().default([]),
	renewal_frequency_in_days: z.number().optional(),
	prerequisites: z.array(z.string()).optional().default([]),
	skills: z.array(z.string()).optional().default([]),
	recommendation_list: z.array(z.string()).optional().default([]),
	study_guide: z.array(StudyGuideReferenceSchema).optional().default([]),
	exam_duration_in_minutes: z.number().optional(),
	locales: z.array(z.string()).optional().default([]),
	providers: z.array(ProviderInfoSchema).optional().default([]),
	career_paths: z.array(CareerPathInfoSchema).optional().default([]),
    retirement_date: ISODateStringSchema.optional(),
});
export type MergedCertificationRecord = z.infer<typeof MergedCertificationRecordSchema>;

export const CertificationRecordSchema = BaseLearningRecordSchema.extend({
	type: z.literal('cert'),
	title: z.string(),
	subtitle: z.string().optional().nullable(),
	url: z.string(),
	icon_url: z.string().optional().nullable(),
	certification_type: CertificationTypeSchema.optional(),
	exams: z.array(z.string()).optional().default([]),
	levels: z.array(z.string()).optional().default([]),
	roles: z.array(z.string()).optional().default([]),
	study_guide: z.array(StudyGuideReferenceSchema).optional().default([]),
});
export type CertificationRecord = z.infer<typeof CertificationRecordSchema>;

export const ExamRecordSchema = BaseLearningRecordSchema.extend({
	type: z.literal('exam'),
	title: z.string(),
	subtitle: z.string().optional().nullable(),
	display_name: z.string().optional().nullable(),
	url: z.string(),
	icon_url: z.string().optional().nullable(),
	pdf_download_url: z.string().optional().nullable(),
	practice_test_url: z.string().optional().nullable(),
	practice_assessment_url: z.string().optional().nullable(),
	locales: z.array(z.string()).optional().default([]),
	courses: z.array(z.string()).optional().default([]),
	levels: z.array(z.string()).optional().default([]),
	roles: z.array(z.string()).optional().default([]),
	products: z.array(z.string()).optional().default([]),
	providers: z.array(ProviderInfoSchema).optional().default([]),
	study_guide: z.array(StudyGuideReferenceSchema).optional().default([]),
});
export type ExamRecord = z.infer<typeof ExamRecordSchema>;

export const CourseRecordSchema = BaseLearningRecordSchema.extend({
	type: z.literal('course'),
	course_number: z.string().optional(),
	title: z.string(),
	summary: z.string().optional(),
	duration_in_hours: z.number().nonnegative().optional(),
	url: z.string(),
	icon_url: z.string().optional().nullable(),
	locales: z.array(z.string()).optional().default([]),
	certification: z.string().optional().nullable(),
	exam: z.string().optional().nullable(),
	levels: z.array(z.string()).optional().default([]),
	roles: z.array(z.string()).optional().default([]),
	products: z.array(z.string()).optional().default([]),
	study_guide: z.array(StudyGuideReferenceSchema).optional().default([]),
});
export type CourseRecord = z.infer<typeof CourseRecordSchema>;

export const TaxonomyNodeSchema: z.ZodType<{
	id: string; name: string; children?: any[];
}> = z.object({
	id: z.string(),
	name: z.string(),
	children: z.lazy(() => z.array(TaxonomyNodeSchema)).optional(),
}).catchall(z.unknown());
export type TaxonomyNode = z.infer<typeof TaxonomyNodeSchema>;

export const CatalogResponseSchema = z.object({
	modules: z.array(ModuleRecordSchema).optional(),
	units: z.array(UnitRecordSchema).optional(),
	learningPaths: z.array(LearningPathRecordSchema).optional(),
	appliedSkills: z.array(AppliedSkillRecordSchema).optional(),
	mergedCertifications: z.array(MergedCertificationRecordSchema).optional(),
	certifications: z.array(CertificationRecordSchema).optional(),
	exams: z.array(ExamRecordSchema).optional(),
	courses: z.array(CourseRecordSchema).optional(),
	levels: z.array(TaxonomyNodeSchema).optional(),
	products: z.array(TaxonomyNodeSchema).optional(),
	roles: z.array(TaxonomyNodeSchema).optional(),
	subjects: z.array(TaxonomyNodeSchema).optional(),
}).catchall(z.unknown());
export type CatalogResponse = z.infer<typeof CatalogResponseSchema>;

export type CatalogContentRecord =
	| ModuleRecord
	| UnitRecord
	| LearningPathRecord
	| AppliedSkillRecord
	| MergedCertificationRecord
	| CertificationRecord
	| ExamRecord
	| CourseRecord;

export function isLearningPath(item: LearningPathRecord | ModuleRecord): item is LearningPathRecord {
	return item.type === "learningPath";
}