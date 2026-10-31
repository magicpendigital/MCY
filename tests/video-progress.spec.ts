import { expect, test, type Page } from "@playwright/test";
import { WatchAccumulator } from "../src/courses/youtubeProgress";

test.use({ viewport: { width: 390, height: 844 } });

// The YouTube IFrame API is replaced by a controllable fake, so these tests prove how MCY reacts to the
// player's reports (and to its absence). They are not evidence about real YouTube playback or a WebView.
const fakeApi = `
window.YT = { Player: class {
  constructor(frame, options) { this.options = options; this.state = -1; this.time = 0; this.duration = 0; window.__yt = this; setTimeout(() => options.events.onReady && options.events.onReady(), 0); }
  getCurrentTime() { return this.time; } getDuration() { return this.duration; } getPlayerState() { return this.state; }
} };
setTimeout(() => window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady(), 0);
`;

async function openFirstLesson(page: Page, api: "fake" | "blocked") {
  await page.route("https://www.youtube-nocookie.com/embed/**", route => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Embedded player fixture</title>" }));
  await page.route("https://www.youtube.com/iframe_api", route => api === "fake" ? route.fulfill({ status: 200, contentType: "text/javascript", body: fakeApi }) : route.abort("blockedbyclient"));
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await page.getByRole("button", { name: "Tìm bài học ngắn" }).click();
  await page.getByTestId("free-course-catalog").getByRole("button", { name: /Một chút chuyển động nhẹ/ }).click();
  await page.locator(".mcy-course-play").click();
  await expect(page.locator('iframe[src*="enablejsapi=1"]')).toHaveCount(1);
}
/** Drives the fake player like a real one: a state change with the current time, one second at a time. */
async function play(page: Page, seconds: number, from = 0, duration = 43) {
  await page.waitForFunction(() => Boolean((window as unknown as { __yt?: unknown }).__yt));
  await page.evaluate(({ seconds, from, duration }) => {
    const player = (window as unknown as { __yt: { time: number; state: number; duration: number; options: { events: { onStateChange: (event: { data: number }) => void } } } }).__yt;
    player.duration = duration; player.state = 1;
    for (let t = from; t <= from + seconds; t += 1) { player.time = t; player.options.events.onStateChange({ data: 1 }); }
  }, { seconds, from, duration });
}

test("accumulator counts only forward playback, so a seek to the end is not a watched lesson", () => {
  const smooth = new WatchAccumulator();
  for (let t = 0; t <= 40; t += 1) smooth.tick(t, true, 43);
  expect(smooth.summary("playing")).toMatchObject({ watchedSeconds: 40, durationSeconds: 43, completed: true });

  const seeked = new WatchAccumulator();
  seeked.tick(0, true, 43); seeked.tick(1, true, 43);
  seeked.tick(42, true, 43); // a jump, not 41 watched seconds
  seeked.markEnded();
  expect(seeked.summary("ended")).toMatchObject({ watchedSeconds: 1, completed: false });

  const paused = new WatchAccumulator();
  paused.tick(0, true, 43); paused.tick(10, false, 43); paused.tick(11, true, 43);
  expect(paused.summary("playing").watchedSeconds).toBe(1);

  const partial = new WatchAccumulator();
  for (let t = 0; t <= 30; t += 1) partial.tick(t, true, 43);
  expect(partial.summary("playing").completed).toBe(false);
  partial.markEnded();
  expect(partial.summary("ended").completed).toBe(true); // ended after at least 60% played forward
});

test("a lesson played to the end is remembered as watched, and the next lesson is offered, not auto-played", async ({ page }) => {
  await openFirstLesson(page, "fake");
  await expect(page.getByTestId("course-complete")).toHaveCount(0);
  await expect(page.locator(".mcy-course-reflection-prompt")).toContainText("MCY chưa ghi nhận bạn xem hết video này");
  await play(page, 40);
  await expect(page.getByTestId("course-complete")).toHaveText("Bạn đã xem hết bài này.");
  await expect(page.getByTestId("course-tracking-note")).toContainText("không gửi đi");
  const stored = JSON.parse((await page.evaluate(() => window.localStorage.getItem("mcy.lessonMemory.v1")))!);
  expect(stored.progress["gentle:01"]).toMatchObject({ completed: true, durationSeconds: 43 });
  expect(stored.progress["gentle:01"].watchedSeconds).toBeGreaterThanOrEqual(36.6);
  await expect(page.locator(".mcy-course-lesson").first()).toContainText("đã xem hết");

  // Scroll first, as the other lesson-list specs do: the mobile scroller can swallow a click that follows its own auto-scroll.
  const next = page.getByRole("button", { name: "Chọn bài tiếp theo" });
  await next.scrollIntoViewIfNeeded();
  await next.click();
  await expect(page.locator(".mcy-course-featured-copy h2")).toContainText("02 ·");
  // Choosing the next lesson shows its poster again; playback starts only when the learner presses Play.
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator(".mcy-course-play")).toBeVisible();
});

test("watching part of a lesson, or skipping to the end, is not recorded as watched", async ({ page }) => {
  await openFirstLesson(page, "fake");
  await play(page, 10);
  await expect(page.getByTestId("course-tracking-note")).toBeVisible();
  await expect(page.getByTestId("course-complete")).toHaveCount(0);
  // Seek to the end and finish: a jump of 30 seconds does not count as watched time.
  await page.evaluate(() => {
    const player = (window as unknown as { __yt: { time: number; state: number; options: { events: { onStateChange: (event: { data: number }) => void } } } }).__yt;
    player.time = 42; player.state = 0; player.options.events.onStateChange({ data: 0 });
  });
  await expect(page.getByTestId("course-complete")).toHaveCount(0);
  const stored = JSON.parse((await page.evaluate(() => window.localStorage.getItem("mcy.lessonMemory.v1")))!);
  expect(stored.progress["gentle:01"].completed).toBe(false);
  await expect(page.locator(".mcy-course-lesson").first()).toContainText("đã mở");
  await expect(page.getByRole("button", { name: "Tôi đã thực hành · ghi cảm nhận" })).toBeVisible();
});

test("when the player API cannot load, the lesson still plays and nothing claims it was watched", async ({ page }) => {
  await openFirstLesson(page, "blocked");
  await expect(page.locator("iframe")).toHaveCount(1);
  await expect(page.getByTestId("course-tracking-note")).toHaveCount(0);
  await expect(page.getByTestId("course-complete")).toHaveCount(0);
  await expect(page.locator(".mcy-course-reflection-prompt")).toContainText("MCY chưa ghi nhận bạn xem hết video này");
  await expect(page.getByRole("button", { name: "Tôi đã thực hành · ghi cảm nhận" })).toBeVisible();
  const stored = JSON.parse((await page.evaluate(() => window.localStorage.getItem("mcy.lessonMemory.v1")))!);
  expect(stored.progress).toEqual({});
  expect(stored.opened).toEqual([{ courseId: "gentle", lessonId: "01" }]);
});
