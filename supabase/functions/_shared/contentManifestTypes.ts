// Shape of the public content snapshot. No imports on purpose: the learner app imports these types, and the Edge function that
// writes the file (contentPublication.ts) imports them too, so both sides agree on one definition.
export type PublishedLesson = {
  id: string; title: string; youtube_id: string; summary: string; duration: string; orientation: "portrait" | "landscape";
  visibility?: string; captions_verified: boolean; caption_languages: string[]; tags?: string[]; byline: string | null;
};
export type PublishedGroup = { id: string; title: string; summary: string; lesson_ids: string[]; guidance?: { reviewed: boolean; benefits: string[]; cautions: string[] }; byline: string | null };
export type ContentManifest = {
  v: 1; generated_at: string;
  display: { discover_order: string[]; policies: { show_teacher_names: boolean; ai_image_label: boolean }; editors_choice: string[] };
  groups: PublishedGroup[]; lessons: PublishedLesson[];
};
