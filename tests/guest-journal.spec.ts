import { expect, test, type Page } from "@playwright/test";
import { CONSENT_POLICY_VERSIONS, emptyConsentState } from "../src/backend/learnerData";

// Plan 2026-11-24 step 2: a guest's check-ins stay on this device (mcy.guest.journal.v1) and are never sent anywhere.
const KEY = "mcy.guest.journal.v1";
const nav = (page: Page, name: string) => page.locator('[data-testid="flow-fixed-footer"]').getByRole("button", { name, exact: true });
const stored = (page: Page) => page.evaluate(key => {
  const raw = localStorage.getItem(key);
  return raw === null ? null : (JSON.parse(raw) as { version: number; entries: { status: string }[] });
}, KEY);

async function enterAsGuest(page: Page) {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
}
async function guestSave(page: Page, status: "Mệt" | "Khó chịu") {
  await enterAsGuest(page);
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  await page.locator(".mcy-body-status-actions").getByRole("button", { name: status, exact: true }).click();
  await expect(page.getByTestId("guest-save-note")).toHaveText("Chỉ lưu trên máy này, không gửi đi đâu. Bạn có thể xóa trong Hành trình.");
  // The note uses the muted text token (--mcy-muted → --color-text-muted #56665a), not an inherited fallback.
  await expect(page.getByTestId("guest-save-note")).toHaveCSS("color", "rgb(86, 102, 90)");
  await page.getByRole("button", { name: "Chỉ ghi lại cảm nhận hôm nay, không chọn bài", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Hành trình của bạn" })).toBeVisible();
}
async function openJourneyAsGuest(page: Page) {
  await enterAsGuest(page);
  await nav(page, "Hành trình").click();
  await expect(page.getByRole("heading", { name: "Hành trình của bạn" })).toBeVisible();
}

test("a guest's check-ins stay on this device across reloads, delete one by one, and delete all with confirmation", async ({ page }) => {
  const outbound: string[] = [];
  page.on("request", request => { if (request.method() !== "GET" && request.url().startsWith("https://mcy-playwright.invalid")) outbound.push(request.url()); });

  await guestSave(page, "Mệt");
  await expect(page.getByText("CHỈ LƯU TRÊN MÁY NÀY", { exact: true })).toBeVisible();
  await expect(page.locator(".mcy-journey-device")).toContainText("Ghi nhận khi chưa đăng nhập chỉ nằm trên máy này.");
  expect((await stored(page))?.entries.map(entry => entry.status)).toEqual(["tired"]);

  await guestSave(page, "Khó chịu");
  expect((await stored(page))?.version).toBe(1);
  expect((await stored(page))?.entries.map(entry => entry.status)).toEqual(["tired", "uncomfortable"]);

  // Reload: the entries are read back from the device.
  await page.reload();
  await openJourneyAsGuest(page);
  await expect(page.getByText("CHỈ LƯU TRÊN MÁY NÀY", { exact: true })).toBeVisible();
  await expect(page.locator(".mcy-journey-empty")).toHaveCount(0);
  await expect(page.locator(".mcy-record-carousel button")).toHaveCount(2);

  // Delete the selected (newest) entry; the deletion persists after a reload.
  await page.getByRole("button", { name: "Xóa bản ghi này" }).click();
  await expect(page.getByText("Bản ghi sẽ bị xóa khỏi máy này và không khôi phục được.")).toBeVisible();
  await page.getByRole("button", { name: "Xóa bản ghi", exact: true }).click();
  await expect.poll(async () => (await stored(page))?.entries.map(entry => entry.status)).toEqual(["tired"]);
  await page.reload();
  await openJourneyAsGuest(page);
  await expect(page.locator(".mcy-record-carousel")).toHaveCount(0);
  await expect(page.getByText("CHỈ LƯU TRÊN MÁY NÀY", { exact: true })).toBeVisible();

  // Delete everything on this device: a confirmation sheet first, "Giữ lại" keeps them.
  await page.getByRole("button", { name: "Xóa mọi ghi nhận trên máy này", exact: true }).click();
  await expect(page.getByText("Mọi ghi nhận đã lưu trên máy này sẽ bị xóa và không khôi phục được.")).toBeVisible();
  await page.getByRole("button", { name: "Giữ lại", exact: true }).click();
  expect((await stored(page))?.entries).toHaveLength(1);
  await page.getByRole("button", { name: "Xóa mọi ghi nhận trên máy này", exact: true }).click();
  await page.getByRole("button", { name: "Xóa tất cả", exact: true }).click();
  await expect(page.locator(".mcy-journey-empty")).toBeVisible();
  await expect.poll(() => stored(page)).toBeNull();
  await page.reload();
  await openJourneyAsGuest(page);
  await expect(page.locator(".mcy-journey-empty")).toBeVisible();

  expect(outbound).toEqual([]);
});

test("blocked storage keeps a guest's check-in for this session only and says so", async ({ page }) => {
  await page.addInitScript(() => {
    const blocked = () => { throw new DOMException("blocked", "SecurityError"); };
    Storage.prototype.setItem = blocked;
    Storage.prototype.getItem = blocked;
  });
  await enterAsGuest(page);
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).click();
  await page.locator(".mcy-body-status-actions").getByRole("button", { name: "Mệt", exact: true }).click();
  await expect(page.getByTestId("guest-save-note")).toHaveText("Máy này đang chặn bộ nhớ, nên ghi nhận chỉ được giữ đến khi bạn đóng hoặc tải lại app. Không gửi đi đâu.");
  await page.getByRole("button", { name: "Chỉ ghi lại cảm nhận hôm nay, không chọn bài", exact: true }).click();
  await expect(page.getByText("CHỈ LƯU TRÊN MÁY NÀY", { exact: true })).toBeVisible();
  await expect(page.locator(".mcy-journey-device")).toContainText("Máy này đang chặn bộ nhớ, nên các ghi nhận chỉ được giữ đến khi bạn đóng hoặc tải lại app.");
});

// Fictional data below; seeded once per tab (sessionStorage guard) so a reload does not seed again.
const seededEntry = { id: "guest-seeded-neck", date: "2026-11-20", time: "08:30", kind: "Ghi riêng", status: "reported", observations: [{ region: "neck", side: "unspecified", level: "Nhẹ", status: "reported", note: "" }] };
const userId = "55555555-5555-4555-8555-555555555555";
const session = { access_token: "fictional-guest-journal-token", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "fictional-refresh", user: { id: userId, aud: "authenticated", role: "authenticated", email: "guest-journal@example.test", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: {}, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z" } };
async function seed(page: Page, withSession: boolean) {
  await page.addInitScript(([key, journal, auth]) => {
    if (sessionStorage.getItem("fixture-seeded")) return;
    sessionStorage.setItem("fixture-seeded", "1");
    // Dated today (device local time) so Journey opens on it.
    const now = new Date(); const pad = (value: number) => String(value).padStart(2, "0");
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    localStorage.setItem(key as string, JSON.stringify({ ...journal, entries: journal.entries.map(entry => ({ ...entry, date: today })) }));
    if (auth) localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(auth));
  }, [KEY, { version: 1, entries: [seededEntry] }, withSession ? session : null] as const);
}
async function accountBackend(page: Page, profileGate?: Promise<void>) {
  const writes: string[] = [];
  await page.route("https://mcy-playwright.invalid/**", async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() !== "GET" && (request.postData() ?? "").includes("guest-seeded-neck")) writes.push(path);
    if (path.endsWith("/logout")) return route.fulfill({ status: 204, body: "" });
    if (path.endsWith("/profiles")) {
      if (profileGate) await profileGate;
      return route.fulfill({ json: { user_id: userId, display_name: "Guest Journal", locale: "vi-VN", body_display_preference: "neutral" } });
    }
    if (path.endsWith("/get_my_consent_state")) return route.fulfill({ json: { ...emptyConsentState, terms: true, privacy: true, wellbeing_data: true } });
    if (path.endsWith("/get_my_consent_policy_versions")) return route.fulfill({ json: CONSENT_POLICY_VERSIONS });
    if (path.endsWith("/owner-control-plane")) return route.fulfill({ status: 403, json: { error: "content_review_access_required" } });
    if (path.endsWith("/mcy-ai-assistant")) return route.fulfill({ json: { available: false, contractVersion: "reviewed-practice-1" } });
    return route.fulfill({ json: path.endsWith("/user") ? session.user : [] });
  });
  return writes;
}
const storedRaw = (page: Page) => page.evaluate(key => localStorage.getItem(key), KEY);

test("editing an area of a guest entry in Journey persists on this device after a reload", async ({ page }) => {
  await seed(page, false);
  await openJourneyAsGuest(page);
  await expect(page.getByText("CHỈ LƯU TRÊN MÁY NÀY", { exact: true })).toBeVisible();
  await page.locator(".mcy-snapshot-list").getByRole("button", { name: /Cổ/ }).click();
  await page.getByRole("button", { name: "Sửa ghi nhận vùng này" }).click();
  await page.locator(".mcy-editor-options").getByRole("button", { name: "Đau nhức", exact: true }).click();
  await page.getByRole("button", { name: "Lưu vùng này" }).click();
  await expect(page.locator(".mcy-snapshot-list")).toContainText("Đau nhức");
  await expect.poll(async () => JSON.parse((await storedRaw(page)) ?? "null")?.entries[0]?.observations[0]?.level).toBe("Nhiều");
  await page.reload();
  await openJourneyAsGuest(page);
  await expect(page.locator(".mcy-snapshot-list")).toContainText("Đau nhức");
});

test("guest entries are hidden from a signed-in account and reappear after signing out, never uploaded", async ({ page }) => {
  await seed(page, true);
  const writes = await accountBackend(page);
  await page.goto("/?mode=web");
  await expect(page.getByRole("button", { name: "Trải nghiệm thử" })).toHaveCount(0); // restored account skips welcome
  await nav(page, "Hành trình").click();
  await expect(page.getByRole("heading", { name: "Hành trình của bạn" })).toBeVisible();
  await expect(page.locator(".mcy-journey-empty")).toBeVisible();
  await expect(page.getByText("CHỈ LƯU TRÊN MÁY NÀY", { exact: true })).toHaveCount(0);

  await nav(page, "Cá nhân").click();
  await page.locator(".mcy-account-home").last().getByRole("button", { name: "Đăng xuất thiết bị này", exact: true }).click();
  await expect(page.getByRole("button", { name: "Tạo tài khoản hoặc đăng nhập" }).last()).toBeVisible();
  await nav(page, "Hành trình").click();
  await expect(page.getByText("CHỈ LƯU TRÊN MÁY NÀY", { exact: true })).toBeVisible();
  await expect(page.locator(".mcy-snapshot-list")).toContainText("Cổ");
  expect(writes).toEqual([]);
  expect(await storedRaw(page)).toContain("guest-seeded-neck");
});

test("while a stored sign-in is being restored, guest entries stay hidden and a check-in is not saved to the device", async ({ page }) => {
  await seed(page, true);
  let release = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  const writes = await accountBackend(page, gate);
  await page.goto("/?mode=web");
  await expect(page.getByRole("status").filter({ hasText: "Đang khôi phục phiên đăng nhập" })).toBeVisible();
  const before = await storedRaw(page);
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await nav(page, "Hành trình").click();
  await expect(page.getByRole("heading", { name: "Hành trình của bạn" })).toBeVisible();
  await expect(page.locator(".mcy-journey-empty")).toBeVisible();
  await expect(page.getByText("CHỈ LƯU TRÊN MÁY NÀY", { exact: true })).toHaveCount(0);

  await nav(page, "Hôm nay").click();
  await page.getByRole("button", { name: "Bắt đầu check-in", exact: true }).last().click();
  await page.locator(".mcy-body-status-actions").getByRole("button", { name: "Mệt", exact: true }).click();
  await expect(page.getByTestId("checkin-restore")).toContainText("Đang khôi phục phiên đăng nhập");
  await expect(page.getByRole("button", { name: "Chỉ ghi lại cảm nhận hôm nay, không chọn bài", exact: true })).toHaveCount(0);
  await expect(page.getByTestId("guest-save-note")).toHaveCount(0);
  expect(await storedRaw(page)).toBe(before);

  // Once the account is restored the same screen offers the account save, still without the guest note.
  release();
  await expect(page.getByTestId("checkin-restore")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Chỉ ghi lại cảm nhận hôm nay, không chọn bài", exact: true })).toBeVisible();
  await expect(page.getByTestId("guest-save-note")).toHaveCount(0);
  expect(await storedRaw(page)).toBe(before);
  expect(writes).toEqual([]);
});
