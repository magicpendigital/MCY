import assert from "node:assert/strict";
import test from "node:test";
import { FREE_COURSES } from "../src/courses/freeCourses.ts";
import { findLessons, formatLessonDuration, lessonAreas, lessonLength, lessonSeconds, shortestLessons, LESSON_AREAS } from "../src/courses/lessonFinder.ts";

const all = FREE_COURSES.flatMap(course => course.lessons.map(lesson => ({ course, lesson })));
test("durations parse and bucket without guessing", () => {
  assert.equal(lessonSeconds("1:04"), 64);
  assert.equal(lessonSeconds("0:17"), 17);
  assert.ok(Number.isNaN(lessonSeconds("abc")));
  assert.equal(lessonLength({ duration: "0:29" }), "short");
  assert.equal(lessonLength({ duration: "0:30" }), "medium");
  assert.equal(lessonLength({ duration: "1:04" }), "medium");
  assert.equal(lessonLength({ duration: "2:00" }), null);
  assert.equal(formatLessonDuration(17), "17 giây");
  assert.equal(formatLessonDuration(64), "1 phút 4 giây");
  assert.equal(formatLessonDuration(120), "2 phút");
});
test("every one of the 38 lessons has a parseable length and each area filter finds only matching titles", () => {
  assert.equal(all.length, 38);
  for (const { lesson } of all) assert.ok(lessonLength(lesson), lesson.title);
  const neck = findLessons(FREE_COURSES, { area: "neck-shoulders" }).map(item => item.lesson.title);
  assert.ok(neck.length >= 3 && neck.every(title => /cổ|vai/i.test(title)), neck.join("|"));
  assert.ok(neck.includes("06 · Chuyển động cổ và lưng trên"));
  for (const area of LESSON_AREAS) assert.ok(findLessons(FREE_COURSES, { area: area.id }).length > 0, area.id);
});
test("poses area follows the course, titles drive the body areas, and filters combine", () => {
  const poses = findLessons(FREE_COURSES, { area: "poses" });
  assert.equal(poses.length, 13 + 7);
  assert.deepEqual(lessonAreas({ title: "Bò mèo" }, "poses").sort(), ["back", "poses"]);
  const shortBack = findLessons(FREE_COURSES, { area: "back", length: "short" });
  assert.ok(shortBack.every(item => item.seconds < 30 && lessonAreas(item.lesson, item.courseId).includes("back")));
});
test("shortest lessons are ordered by duration only", () => {
  const shortest = shortestLessons(FREE_COURSES, 3);
  assert.equal(shortest.length, 3);
  assert.ok(shortest[0].seconds <= shortest[1].seconds && shortest[1].seconds <= shortest[2].seconds);
  assert.equal(shortest[0].seconds, Math.min(...all.map(item => lessonSeconds(item.lesson.duration))));
});
