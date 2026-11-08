import { expect, test, type Page, type Route } from "@playwright/test";
import { readingUnitCandidates } from "../supabase/functions/_shared/readingUnitCandidates";
import { buildManifest, internalWording, projectUnit } from "../supabase/functions/_shared/readingPublication";

// Guest reading flow against fictional public files on the isolated .invalid backend. It exercises the learner screens
// (Khám phá entry, overview, steps, text-only, done, error states); it is not evidence about the real bucket or CDN.
test.use({ viewport: { width: 390, height: 844 } });

const base = "https://mcy-playwright.invalid/storage/v1/object/public/reading-published";
const webp = Buffer.from("UklGRiQAAABXRUJQVlA4IBgAAABQAQCdASoBAAEAAUAmJaQABYwAAP6igAA=", "base64");
const cobra = readingUnitCandidates.find(c => c.id === "reading-cobra")!;
const cobraProjection = projectUnit(cobra);
if (!cobraProjection.ok) throw new Error("fixture unit must project");
const imageUnit = cobraProjection.unit;
const textUnit = { ...imageUnit, id: "reading-low-crow", version: "b".repeat(64), title: "Quạ thấp · bài chỉ chữ", steps: imageUnit.steps.map(step => ({ ...step, images: [] })) };
const entry = (unit: typeof imageUnit, images: "complete" | "none") => ({ id: unit.id, version: unit.version, title: unit.title, steps: unit.steps.length, images, imageHashes: [], path: `units/${unit.id}/${unit.version}.json` });

type Files = { manifest?: unknown | number; units?: Record<string, unknown | number>; image?: number };
async function files(page: Page, config: Files) {
  const forbidden: string[] = [];
  // Routes registered later win, so the generic 404 goes first and the specific files below override it.
  await page.route("https://mcy-playwright.invalid/**", route => route.fulfill({ status: 404, json: { error: "unexpected" } }));
  await page.route("https://*.supabase.co/**", route => { forbidden.push(route.request().url()); return route.abort("blockedbyclient"); });
  await page.route(base + "/**", (route: Route) => {
    const path = new URL(route.request().url()).pathname.replace("/storage/v1/object/public/reading-published/", "");
    if (path === "manifest.json") return typeof config.manifest === "number" ? route.fulfill({ status: config.manifest, json: { error: "x" } }) : config.manifest === undefined ? route.fulfill({ status: 404, json: { error: "not_found" } }) : route.fulfill({ json: config.manifest });
    if (path.endsWith(".webp")) return config.image ? route.fulfill({ status: config.image, body: "" }) : route.fulfill({ contentType: "image/webp", body: webp });
    const unit = config.units?.[path];
    return unit === undefined || typeof unit === "number" ? route.fulfill({ status: typeof unit === "number" ? unit : 404, json: { error: "not_found" } }) : route.fulfill({ json: unit });
  });
  return forbidden;
}
const manifestOf = (...units: Array<[typeof imageUnit, "complete" | "none"]>) => ({ v: 1, generatedAt: "2026-11-02T00:00:00.000Z", units: units.map(([unit, images]) => entry(unit, images)) });
async function openDiscover(page: Page) {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await page.getByRole("button", { name: "Tìm bài học ngắn" }).click();
  // The first run compiles the lazy Khám phá chunk on a cold dev server, so allow it extra time.
  await expect(page.getByRole("heading", { name: "Bài học yoga miễn phí" })).toBeVisible({ timeout: 30_000 });
}
const footer = (page: Page) => page.locator('[data-testid="flow-fixed-footer"]');

test("a guest reads an illustrated unit step by step, resumes where they stopped and reaches the end", async ({ page }) => {
  const forbidden = await files(page, { manifest: manifestOf([imageUnit, "complete"]), units: { [`units/${imageUnit.id}/${imageUnit.version}.json`]: imageUnit } });
  await openDiscover(page);
  const section = page.getByTestId("reading-entry");
  await expect(section.getByRole("heading", { name: "Bài đọc có hình" })).toBeVisible();
  await expect(section.locator(".mcy-rl-badge")).toHaveText("CÓ HÌNH");
  await section.getByRole("button", { name: new RegExp(imageUnit.title.slice(0, 12)) }).click();

  await expect(page.getByRole("heading", { level: 1, name: imageUnit.title })).toBeVisible();
  await expect(page.locator(".mcy-rl-stop")).toContainText("Đau, tê, choáng hoặc mất vững");
  const hero = page.locator(".mcy-rl-figure img").first();
  await expect(hero).toHaveAttribute("src", new RegExp(`^${base}/[a-f0-9]{64}\\.webp$`));
  await expect(page.locator(".mcy-rl-ai").first()).toHaveText("HÌNH AI");
  await footer(page).getByRole("button", { name: "Bắt đầu · bước 1/5" }).click();

  await expect(page.getByRole("heading", { level: 2, name: imageUnit.steps[0].title })).toBeFocused();
  await expect(page.getByRole("progressbar", { name: "Tiến độ bài đọc" })).toHaveAttribute("aria-valuetext", "Bước 1 trên 5");
  await expect(page.locator(".mcy-rl-figure figcaption").first()).toContainText("Chỉ để minh hoạ.");
  await footer(page).getByRole("button", { name: /Bước 2/ }).click();
  await footer(page).getByRole("button", { name: /Bước 3/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: imageUnit.steps[2].title })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Tiến độ bài đọc" })).toHaveAttribute("aria-valuetext", "Bước 3 trên 5");

  // Leave and come back: the unit offers to continue at step 3, or to start again.
  await page.getByRole("button", { name: "Quay lại" }).click();
  await expect(page.getByRole("heading", { name: "Bài học yoga miễn phí" })).toBeVisible();
  await page.getByTestId("reading-entry").getByRole("button", { name: new RegExp(imageUnit.title.slice(0, 12)) }).click();
  await expect(page.locator(".mcy-rl-resume")).toContainText("bước 3/5");
  await footer(page).getByRole("button", { name: "Tiếp tục · bước 3/5" }).click();
  await expect(page.getByRole("heading", { level: 2, name: imageUnit.steps[2].title })).toBeVisible();

  await footer(page).getByRole("button", { name: /Bước 4/ }).click();
  await footer(page).getByRole("button", { name: /Bước 5/ }).click();
  await footer(page).getByRole("button", { name: "Xong phần đọc" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Bạn đã đọc hết 5 bước." })).toBeVisible();
  await expect(page.locator("[data-testid=flow-current] main")).toContainText("Đọc hết không ghi nhận một buổi tập");
  await expect(footer(page).getByRole("button", { name: "Về danh sách bài đọc" })).toBeVisible();
  const visible = await page.locator("[data-testid=flow-current] main").innerText();
  expect(internalWording.test(visible)).toBe(false);
  expect(forbidden).toEqual([]);
});

test("a text-only unit is labelled honestly and shows no empty picture frames", async ({ page }) => {
  await files(page, { manifest: manifestOf([textUnit, "none"]), units: { [`units/${textUnit.id}/${textUnit.version}.json`]: textUnit } });
  await openDiscover(page);
  const section = page.getByTestId("reading-entry");
  await expect(section.locator(".mcy-rl-badge")).toHaveText("CHỈ CHỮ");
  await section.locator(".mcy-rl-row").first().click();
  await footer(page).getByRole("button", { name: "Bắt đầu · bước 1/5" }).click();
  await expect(page.locator(".mcy-rl-textonly")).toContainText("Bài này đọc bằng chữ.");
  await expect(page.locator(".mcy-rl-figure")).toHaveCount(0);
  await expect(page.locator(".mcy-rl-figure-empty")).toHaveCount(0);
});

test("with no published units, or an unreachable manifest, Khám phá simply shows nothing new", async ({ page }) => {
  await files(page, {});
  await openDiscover(page);
  await expect(page.getByTestId("reading-entry")).toHaveCount(0);
  await expect(page.getByTestId("free-course-catalog")).toBeVisible();
  const broken = await page.context().newPage();
  await files(broken, { manifest: 503 });
  await openDiscover(broken);
  await expect(broken.getByTestId("reading-entry")).toHaveCount(0);
  await expect(broken.getByTestId("free-course-catalog")).toBeVisible();
});

test("a malformed manifest is ignored rather than rendered", async ({ page }) => {
  await files(page, { manifest: { v: 1, units: [{ id: "reading-cobra", version: "x", title: "<img src=x onerror=alert(1)>", steps: 5, images: "complete", path: "../../secret.json" }] } });
  await openDiscover(page);
  await expect(page.getByTestId("reading-entry")).toHaveCount(0);
});

test("a unit that was switched off while listed says so and offers the way back", async ({ page }) => {
  await files(page, { manifest: manifestOf([imageUnit, "complete"]), units: {} });
  await openDiscover(page);
  await page.getByTestId("reading-entry").locator(".mcy-rl-row").first().click();
  await expect(page.getByText("Bài này tạm thời không còn hiển thị.")).toBeVisible();
  await footer(page).getByRole("button", { name: "Về danh sách bài đọc" }).click();
  await expect(page.getByRole("heading", { name: "Bài học yoga miễn phí" })).toBeVisible();
});

test("a picture that fails to load keeps the words readable and can be retried", async ({ page }) => {
  await files(page, { manifest: manifestOf([imageUnit, "complete"]), units: { [`units/${imageUnit.id}/${imageUnit.version}.json`]: imageUnit }, image: 404 });
  await openDiscover(page);
  await page.getByTestId("reading-entry").locator(".mcy-rl-row").first().click();
  await footer(page).getByRole("button", { name: "Bắt đầu · bước 1/5" }).click();
  await expect(page.getByText("Chưa tải được hình").first()).toBeVisible();
  await expect(page.locator(".mcy-rl-body")).toContainText(imageUnit.steps[0].body.slice(0, 20));
  await expect(page.getByRole("button", { name: "Tải lại hình" })).toBeVisible();
});

test("more than three units collapse into a link to the full list", async ({ page }) => {
  const many = ["a", "c", "d", "e"].map((letter, index) => ({ ...imageUnit, id: `reading-sample-${letter}`, version: String(index + 1).repeat(64), title: `Bài mẫu ${letter.toUpperCase()}` }));
  await files(page, { manifest: manifestOf(...many.map(unit => [unit, "complete"] as [typeof imageUnit, "complete"])) });
  await openDiscover(page);
  const section = page.getByTestId("reading-entry");
  await expect(section.locator(".mcy-rl-row")).toHaveCount(3);
  await section.getByRole("button", { name: "Xem tất cả 4 bài đọc" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Bài đọc có hình" })).toBeVisible();
  await expect(page.locator("[data-testid=flow-current] .mcy-rl-list .mcy-rl-row")).toHaveCount(4);
});

test("the manifest builder and the screens agree on shape", () => {
  const manifest = buildManifest([{ candidate: cobra, unit: imageUnit }], new Date("2026-11-02T00:00:00Z"));
  expect(manifest.units[0].path).toBe(`units/${cobra.id}/${cobra.version}.json`);
  expect(manifest.units[0].images).toBe("complete");
});
