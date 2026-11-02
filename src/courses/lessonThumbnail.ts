// Preview image for a free lesson, served by YouTube for the lesson's video id (Owner decision 2026-11-02). Loading it
// contacts i.ytimg.com when a list or poster appears, before the learner presses Play; the privacy copy says so.
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
export function lessonThumbnailUrl(youtubeId: string): string | null {
  return VIDEO_ID.test(youtubeId) ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null;
}
