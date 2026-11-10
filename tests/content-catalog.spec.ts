import { expect, test, type Page, type Route } from "@playwright/test";

// The learner catalogue reads one public snapshot written after the Owner approved and switched content on. These specs use a
// fictional snapshot on the isolated .invalid backend; whatever is wrong with the file, the bundled catalogue must be used.
test.use({ viewport: { width: 390, height: 844 } });

const display = (patch: Record<string, unknown> = {}) => ({ discover_order: ["editors_choice", "video_groups", "quick_find", "reading"], policies: { show_teacher_names: true, ai_image_label: true }, editors_choice: [], ...patch });
const lesson = (id: string, title: string, byline: string | null, patch: Record<string, unknown> = {}) => ({ id, title, youtube_id: "AAAAAAAAAAA", summary: "Fictional lesson summary", duration: "0:43", orientation: "portrait", captions_verified: false, caption_languages: [], byline, ...patch });
const manifest = (patch: Record<string, unknown> = {}) => ({
  v: 1, generated_at: "2026-11-09T00:00:00.000Z",
  display: display({ editors_choice: ["video-demo-a", "group-demo"] }),
  groups: [{ id: "group-demo", title: "Nhóm thử nghiệm của biên tập", summary: "Fictional group summary", lesson_ids: ["video-demo-a", "video-demo-b"], byline: "Lựa chọn của biên tập · MCY biên soạn" }],
  lessons: [lesson("video-demo-a", "Bài của giảng viên thử", "Giảng viên Thử"), lesson("video-demo-b", "Bài của biên tập", "Lựa chọn của biên tập · MCY biên soạn")],
  ...patch,
});
const serve = (page: Page, body: unknown | null) => page.route("**/content-published/manifest.json", (route: Route) => body === null ? route.fulfill({ status: 404, contentType: "application/json", body: "{}" }) : route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }));
async function openDiscover(page: Page) {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await page.getByRole("button", { name: "Tìm bài học ngắn" }).click();
  await expect(page.getByTestId("lesson-finder")).toBeVisible();
}

test("without a snapshot the bundled catalogue and today's order are used", async ({ page }) => {
  await serve(page, null);
  await openDiscover(page);
  await expect(page.getByTestId("editors-choice")).toHaveCount(0);
  await expect(page.getByTestId("free-course-catalog").getByRole("button", { name: /Một chút chuyển động nhẹ/ })).toBeVisible();
  const order = await page.evaluate(() => ["lesson-finder", "free-course-catalog"].map(id => document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect().top));
  expect(order[0]).toBeLessThan(order[1]);                                                   // finder above the groups, as before
});

test("a valid snapshot replaces the groups, shows the Editor's choice first and names the author on the lesson", async ({ page }) => {
  await serve(page, manifest());
  await openDiscover(page);
  const catalog = page.getByTestId("free-course-catalog");
  await expect(catalog.getByRole("button", { name: /Nhóm thử nghiệm của biên tập/ })).toBeVisible();
  await expect(catalog.getByRole("button", { name: /Một chút chuyển động nhẹ/ })).toHaveCount(0);
  const picks = page.getByTestId("editors-choice");
  await expect(picks).toContainText("Bài của giảng viên thử");
  await expect(picks).toContainText("Giảng viên Thử");
  const tops = await page.evaluate(() => ["editors-choice", "free-course-catalog", "lesson-finder"].map(id => document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect().top));
  expect(tops[0]).toBeLessThan(tops[1]);                                                     // the configured order: picks, video groups, then the finder
  expect(tops[1]).toBeLessThan(tops[2]);
  await picks.getByRole("button", { name: /Bài của giảng viên thử/ }).click();
  await expect(page.locator(".mcy-course-featured-copy h2")).toHaveText("Bài của giảng viên thử");
  await expect(page.getByTestId("lesson-byline")).toHaveText("Giảng viên Thử");
});

test("the teacher name is not shown when the policy is off, and a bundled lesson has no byline", async ({ page }) => {
  await serve(page, manifest({ display: display({ policies: { show_teacher_names: false, ai_image_label: true }, editors_choice: ["video-demo-a"] }) }));
  await openDiscover(page);
  await page.getByTestId("editors-choice").getByRole("button", { name: /Bài của giảng viên thử/ }).click();
  await expect(page.locator(".mcy-course-featured-copy h2")).toHaveText("Bài của giảng viên thử");
  await expect(page.getByTestId("lesson-byline")).toHaveCount(0);
  await expect(page.getByText("Giảng viên Thử", { exact: true })).toHaveCount(0);
});

test("areas set by the author drive the finder and the lesson tags; a lesson without them still uses the title rules", async ({ page }) => {
  const explicit = manifest({
    lessons: [lesson("video-demo-a", "Bài có chữ cổ trong tên", null, { areas: ["hips-legs"] }), lesson("video-demo-b", "Bài có chữ lưng trong tên", null, { areas: [] }), lesson("video-demo-c", "Chuyển động cổ nhẹ", null)],
    groups: [{ id: "group-demo", title: "Nhóm thử nghiệm của biên tập", summary: "Fictional group summary", lesson_ids: ["video-demo-a", "video-demo-b", "video-demo-c"], byline: null }],
    display: display(),
  });
  await serve(page, explicit);
  await openDiscover(page);
  await page.getByRole("button", { name: "Cổ và vai" }).first().click();
  const results = page.getByTestId("lesson-finder");
  await expect(results).toContainText("Chuyển động cổ nhẹ");                                   // no explicit areas: the title rule still applies
  await expect(results).not.toContainText("Bài có chữ cổ trong tên");                         // explicit hips-legs wins over the word in the title
  await expect(results).not.toContainText("Bài có chữ lưng trong tên");
  await page.getByRole("button", { name: "Hông và chân" }).first().click();
  await expect(results).toContainText("Bài có chữ cổ trong tên");
});

test("an invalid snapshot is ignored and the bundled catalogue is used", async ({ page }) => {
  const bad = [
    manifest({ display: display({ discover_order: ["reading", "video_groups", "quick_find", "editors_choice"] }) }),         // reading above the videos
    manifest({ lessons: [lesson("video-demo-a", "x", null, { youtube_id: "short" }), lesson("video-demo-b", "y", null)] }),  // bad video id
    manifest({ groups: [{ id: "group-demo", title: "t", summary: "s", lesson_ids: ["video-missing"], byline: null }] }),     // group points at a missing lesson
    manifest({ lessons: [lesson("video-demo-a", "x", null, { areas: ["not-an-area"] }), lesson("video-demo-b", "y", null)] }), // unknown area id
    { v: 2 }, { not: "a manifest" },
  ];
  for (const body of bad) {
    await page.unroute("**/content-published/manifest.json");
    await serve(page, body);
    await openDiscover(page);
    await expect(page.getByTestId("free-course-catalog").getByRole("button", { name: /Một chút chuyển động nhẹ/ })).toBeVisible();
    await expect(page.getByTestId("editors-choice")).toHaveCount(0);
  }
});

test("imported groups keep the ids a device already remembers", async ({ page }) => {
  const imported = {
    v: 1, generated_at: "x", display: display(),
    groups: [{ id: "group-gentle", title: "Một chút chuyển động nhẹ", summary: "Fictional", lesson_ids: ["video-gentle-01", "video-gentle-02"], byline: null }],
    lessons: [lesson("video-gentle-01", "01 · Thư giãn nhẹ", null), lesson("video-gentle-02", "02 · Kéo giãn nhẹ", null, { youtube_id: "BBBBBBBBBBB" })],
  };
  await serve(page, imported);
  await openDiscover(page);
  await page.getByTestId("free-course-catalog").getByRole("button", { name: /Một chút chuyển động nhẹ/ }).click();
  await page.getByRole("button", { name: /Lưu bài này|Lưu trên máy/ }).first().click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("mcy.lessonMemory.v1") ?? "{}"));
  expect(JSON.stringify(stored)).toContain('"courseId":"gentle"');
  expect(JSON.stringify(stored)).toContain('"lessonId":"01"');
  await expect(page.getByTestId("lesson-byline")).toHaveCount(0);                            // imported content is never attributed by accident
});
