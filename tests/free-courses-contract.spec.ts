import { expect, test } from "@playwright/test";

test("free-course source keeps all 38 YouTube lesson records structurally valid", async ({ page }) => {
  await page.goto("/favicon.svg", { waitUntil: "domcontentloaded" });
  const courses = await page.evaluate(async () => {
    const { FREE_COURSES } = await import("/src/courses/freeCourses.ts");
    return FREE_COURSES.map(course => ({
      id: course.id,
      lessons: course.lessons.map(({ id, youtubeId, title, duration, visibility, orientation, channelCaptionsVerified, channelCaptionLanguages }) => ({
        id,
        youtubeId,
        title,
        duration,
        visibility,
        orientation,
        channelCaptionsVerified,
        channelCaptionLanguages,
      })),
    }));
  });

  expect(courses.map(course => [course.id, course.lessons.length])).toEqual([
    ["gentle", 18],
    ["poses", 13],
    ["sequences", 7],
  ]);

  const lessons = courses.flatMap(course => course.lessons);
  expect(lessons).toHaveLength(38);
  expect(lessons.map(lesson => lesson.id)).toEqual(Array.from({ length: 38 }, (_, index) => String(index + 1).padStart(2, "0")));
  expect(new Set(lessons.map(lesson => lesson.youtubeId)).size).toBe(38);

  for (const lesson of lessons) {
    expect(lesson.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
    expect(lesson.title.trim().length).toBeGreaterThan(0);
    expect(lesson.duration).toMatch(/^\d+:[0-5]\d$/);
    expect(lesson.visibility).toBe("unlisted");
    expect(lesson.orientation).toBe("portrait");
    expect(lesson.channelCaptionsVerified).toBe(false);
    expect(lesson.channelCaptionLanguages).toEqual([]);
  }
});
