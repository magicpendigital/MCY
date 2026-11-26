import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

// Chút slice 1 (plan 2026-11-25, Owner approved 26/11). The YouTube embed and IFrame API are replaced by a controllable
// fake, as in video-progress.spec.ts: this proves how MCY reacts to the player's reports, not real YouTube playback,
// autoplay on a real iPhone (iOS 15) or a WebView.
const fakeApi = `
window.YT = { Player: class {
  constructor(frame, options) { this.options = options; this.state = -1; this.time = 0; this.duration = 0; this.loaded = null; window.__yt = this; setTimeout(() => options.events.onReady && options.events.onReady(), 0); }
  getCurrentTime() { return this.time; } getDuration() { return this.duration; } getPlayerState() { return this.state; }
  loadVideoById(id) { this.loaded = id; this.state = -1; this.time = 0; }
} };
setTimeout(() => window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady(), 0);
`;
const GUEST_KEY = "mcy.guest.journal.v1";
const CHUT_KEY = "mcy.chut.v1";
const current = (page: Page) => page.locator('[data-testid="flow-current"]');
const nav = (page: Page, name: string) => page.locator('[data-testid="flow-fixed-footer"]').getByRole("button", { name, exact: true });
const readJson = (page: Page, key: string) => page.evaluate(storageKey => {
  const raw = localStorage.getItem(storageKey);
  return raw === null ? null : JSON.parse(raw);
}, key);

async function stubYouTube(page: Page) {
  await page.route("https://www.youtube-nocookie.com/embed/**", route => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Embedded player fixture</title>" }));
  await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({ status: 200, contentType: "text/javascript", body: fakeApi }));
}
async function enterAsGuest(page: Page) {
  await page.goto("/?mode=web");
  await page.getByRole("button", { name: "Trải nghiệm thử" }).click();
  await expect(page.getByTestId("chut-card")).toBeVisible();
}
async function openRegion(page: Page, label: string) {
  await current(page).getByTestId("chut-card").getByRole("button", { name: new RegExp(`^${label}`) }).click();
  await expect(current(page).getByTestId("chut-sequence")).toBeVisible();
}
/** The fake player plays the loaded clip for a few seconds and then reports its end. */
async function playToEnd(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { __yt?: unknown }).__yt));
  await page.evaluate(() => {
    const player = (window as unknown as { __yt: { time: number; state: number; duration: number; options: { events: { onStateChange: (event: { data: number }) => void } } } }).__yt;
    player.duration = 40; player.state = 1;
    for (let t = 0; t <= 40; t += 1) { player.time = t; player.options.events.onStateChange({ data: 1 }); }
    player.state = 0; player.options.events.onStateChange({ data: 0 });
  });
}
/** One session that ends early on the sequence screen, then an answer on the end screen. */
async function sessionWithAnswer(page: Page, label: string, answer: string) {
  await openRegion(page, label);
  await current(page).getByRole("button", { name: "Dừng chuỗi" }).click();
  await expect(current(page).getByTestId("chut-end")).toBeVisible();
  await current(page).getByRole("button", { name: new RegExp(`^${answer}`) }).click();
}

test("Hôm nay shows the Chút card with four areas, counts and the approved copy", async ({ page }) => {
  await enterAsGuest(page);
  const card = current(page).getByTestId("chut-card");
  await expect(card.getByRole("heading", { name: /Chút/ })).toContainText("trợ lý");
  await expect(card).toContainText("Gợi ý theo quy tắc · chưa dùng AI");
  await expect(card).toContainText("Chào bạn. Hôm nay bạn muốn tập gì?");
  await expect(card).toContainText("Một chạm là bắt đầu. Gợi ý theo vùng bạn chọn, chưa phải chỉ định. Bạn dừng bất cứ lúc nào.");
  await expect(card.getByRole("button", { name: "Tôi đang đau hoặc khó chịu" })).toBeVisible();
  const chips = card.locator(".mcy-chut-chip");
  await expect(chips).toHaveCount(4);
  await expect(chips.locator("strong")).toHaveText(["Cổ và vai", "Lưng", "Hông và chân", "Toàn thân"]);
  const summaries = card.getByTestId("chut-chip-summary");
  await expect(summaries.nth(0)).toHaveText(/^4 bài · ~\d+(,5)? phút$/);
  await expect(summaries.nth(1)).toHaveText(/^4 bài · ~\d+(,5)? phút$/);
  await expect(summaries.nth(2)).toHaveText(/^3 bài · ~\d+(,5)? phút$/);
  await expect(summaries.nth(3)).toHaveText(/^4 bài · ~\d+(,5)? phút$/);
  // A 2x2 grid that never scrolls sideways, every chip at least 48px tall.
  const boxes = await Promise.all([0, 1, 2, 3].map(index => chips.nth(index).boundingBox()));
  expect(boxes.every(box => box && box.height >= 48)).toBe(true);
  expect(boxes[0]!.y).toBe(boxes[1]!.y);
  expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.y);
  expect(await card.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  // The old lead paragraph is gone; the quick picks keep their rows under the new label.
  await expect(current(page).getByText("Chọn một bài ngắn bên dưới để bắt đầu ngay.", { exact: false })).toHaveCount(0);
  await expect(current(page).getByTestId("home-quick-picks").getByRole("heading")).toHaveText("HOẶC BẮT ĐẦU NHẸ NHÀNG · 3 BÀI NGẮN NHẤT");
  await expect(current(page).getByText("Ba bài ngắn nhất trong thư viện", { exact: false })).toHaveCount(0);
  await expect(current(page).getByTestId("home-quick-picks").locator(".mcy-finder-row")).toHaveCount(3);
  await expect(current(page).getByRole("button", { name: "Bắt đầu check-in", exact: true })).toBeVisible();
});

test("a chip opens its sequence; the learner presses Play, a clip end counts down and the next clip loads in the same player", async ({ page }) => {
  await stubYouTube(page);
  await enterAsGuest(page);
  await openRegion(page, "Cổ và vai");
  await expect(page.getByText("Cổ và vai · chuỗi 4 bài", { exact: true })).toBeVisible();
  const screen = current(page).locator("main");
  await expect(screen).toContainText("Bạn tự bấm Phát ở bài đầu");
  await expect(screen.getByTestId("chut-progress")).toContainText("Bài 1 trên 4");
  await expect(screen.getByTestId("chut-progress")).toContainText(/còn khoảng \d/);
  await expect(screen).toContainText("Chút: Vì bạn chọn cổ và vai. Gợi ý theo quy tắc, chưa dùng AI. Dừng nếu đau tăng.");
  await expect(screen.getByRole("heading", { name: "SẮP TỚI" })).toBeVisible();
  await expect(screen.locator(".mcy-chut-upcoming li")).toHaveCount(3);
  await expect(screen.getByRole("switch", { name: /Tự chuyển sang bài tiếp/ })).toHaveAttribute("aria-checked", "true");
  await expect(screen).toContainText("Tắt thì Chút chờ bạn bấm “Bài tiếp”. Lựa chọn này chỉ lưu trên máy này.");
  // Nothing plays until the learner presses Play.
  await expect(screen.locator("iframe")).toHaveCount(0);
  await screen.getByRole("button", { name: /^Phát bài học/ }).click();
  await expect(screen.locator('iframe[src*="enablejsapi=1"]')).toHaveCount(1);
  const firstSrc = await screen.locator("iframe").getAttribute("src");

  await playToEnd(page);
  const countdown = screen.getByTestId("chut-countdown");
  await expect(countdown).toContainText("Bài 1 vừa xong");
  await expect(countdown).toContainText("Bài tiếp sau 3 giây");
  await expect(countdown.locator('[aria-live="polite"]')).toHaveCount(1);
  await expect(countdown.getByRole("button", { name: "Dừng lại" })).toBeVisible();
  // No tap: after 3 seconds the next clip is loaded into the same iframe.
  await expect(screen.getByTestId("chut-progress")).toContainText("Bài 2 trên 4", { timeout: 6000 });
  await expect(screen.locator("iframe")).toHaveCount(1);
  expect(await screen.locator("iframe").getAttribute("src")).toBe(firstSrc);
  expect(await page.evaluate(() => (window as unknown as { __yt: { loaded: string | null } }).__yt.loaded)).toBeTruthy();
  await expect(screen.locator(".mcy-chut-upcoming li")).toHaveCount(2);

  // "Dừng lại" stops the countdown and leaves a manual "Bài tiếp".
  await playToEnd(page);
  await expect(countdown).toContainText("Bài 2 vừa xong");
  await countdown.getByRole("button", { name: "Dừng lại" }).click();
  await expect(countdown).toHaveCount(0);
  await screen.getByRole("button", { name: "Bài tiếp", exact: true }).click();
  await expect(screen.getByTestId("chut-progress")).toContainText("Bài 3 trên 4");

  // "Dừng chuỗi" ends early and says honestly how much was watched: clips 1 and 2 ended; clip 3 was only loaded.
  await screen.getByRole("button", { name: "Dừng chuỗi" }).click();
  const end = current(page).getByTestId("chut-end");
  await expect(end.getByRole("heading", { name: "Buổi vừa rồi" })).toBeVisible();
  await expect(end).toContainText(/^CỔ VÀ VAI · KHOẢNG \d+(,5)? PHÚT/);
  await expect(end).toContainText("Bạn đã xem 2 trên 4 bài.");
});

test("a sequence watched to the end reaches the end screen; turning auto-advance off waits for Bài tiếp and is remembered", async ({ page }) => {
  await stubYouTube(page);
  await enterAsGuest(page);
  await openRegion(page, "Hông và chân");
  const screen = current(page).locator("main");
  await screen.getByRole("switch", { name: /Tự chuyển sang bài tiếp/ }).click();
  await expect(screen.getByRole("switch", { name: /Tự chuyển sang bài tiếp/ })).toHaveAttribute("aria-checked", "false");
  expect((await readJson(page, CHUT_KEY))?.autoAdvance).toBe(false);
  await screen.getByRole("button", { name: /^Phát bài học/ }).click();
  for (const step of [1, 2]) {
    await playToEnd(page);
    await expect(screen.getByTestId("chut-countdown")).toHaveCount(0);
    await screen.getByRole("button", { name: "Bài tiếp", exact: true }).click();
    await expect(screen.getByTestId("chut-progress")).toContainText(`Bài ${step + 1} trên 3`);
  }
  await playToEnd(page);
  const end = current(page).getByTestId("chut-end");
  await expect(end).toContainText("Bạn vừa xem xong 3 bài.");
  await expect(end).toContainText("Thấy thế nào sau buổi này? Bạn ghi lại hay bỏ qua đều được.");
  await expect(end).toContainText("Không ghi gì. Bỏ qua không bị tính là tốt hơn hay kém hơn.");
  await expect(end).toContainText("Đây là cảm nhận của riêng bạn về cả buổi. Chút không tính phần trăm và không so sánh bạn với ai. Nếu bạn chưa có tài khoản, câu trả lời chỉ ở trên máy này.");
  await expect(end.locator(".mcy-chut-choice")).toHaveText(["Dễ chịu hơn", "Như cũ", "Khó chịu hơn", "Chưa rõ", /^Bỏ qua/]);
  // The switch stays off after a reload (this device only).
  await page.reload();
  await enterAsGuest(page);
  await openRegion(page, "Lưng");
  await expect(current(page).getByRole("switch", { name: /Tự chuyển sang bài tiếp/ })).toHaveAttribute("aria-checked", "false");
});

test("under reduced motion the countdown is text only", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await stubYouTube(page);
  await enterAsGuest(page);
  await openRegion(page, "Toàn thân");
  await current(page).getByRole("button", { name: /^Phát bài học/ }).click();
  await playToEnd(page);
  const countdown = current(page).getByTestId("chut-countdown");
  await expect(countdown).toContainText("Bài tiếp sau 3 giây");
  await expect(countdown.locator(".mcy-chut-countdown-bar")).toHaveCount(0);
  await countdown.getByRole("button", { name: "Tiếp ngay" }).click();
  await expect(current(page).getByTestId("chut-progress")).toContainText("Bài 2 trên 4");
});

test("offline Play shows the retry copy instead of a broken player", async ({ page, context }) => {
  await stubYouTube(page);
  await enterAsGuest(page);
  await openRegion(page, "Lưng");
  await context.setOffline(true);
  await current(page).getByRole("button", { name: /^Phát bài học/ }).click();
  await expect(current(page).getByRole("alert")).toContainText("Chưa có mạng nên chưa phát được video. Bạn thử lại khi có mạng.");
  await expect(current(page).locator("iframe")).toHaveCount(0);
  await context.setOffline(false);
  await current(page).getByRole("button", { name: "Thử lại" }).click();
  await expect(current(page).locator("iframe")).toHaveCount(1);
});

test("a guest answer goes to the device journal and shows in Hành trình; Bỏ qua writes nothing", async ({ page }) => {
  await enterAsGuest(page);
  // Bỏ qua: nothing is written, no thanks line, only the way home.
  await sessionWithAnswer(page, "Cổ và vai", "Bỏ qua");
  await expect(current(page).getByText("Cảm ơn bạn đã ghi lại.")).toHaveCount(0);
  expect(await readJson(page, GUEST_KEY)).toBeNull();
  await current(page).getByRole("button", { name: "Xong, về Hôm nay" }).click();
  await expect(current(page).getByTestId("chut-card")).toBeVisible();

  await sessionWithAnswer(page, "Cổ và vai", "Dễ chịu hơn");
  await expect(current(page).getByText("Cảm ơn bạn đã ghi lại.")).toBeVisible();
  const stored = await readJson(page, GUEST_KEY);
  expect(stored.entries).toHaveLength(1);
  expect(stored.entries[0]).toMatchObject({ kind: "Sau tập", lessonTitle: "Chuỗi Cổ và vai", outcome: "Dễ chịu hơn", endedEarly: true });
  // The second session opens the invitation (N = 2); close it to reach Hôm nay.
  await expect(page.getByRole("dialog", { name: "Lưu cảm nhận và Hành trình của bạn" })).toBeVisible();
  await page.getByRole("button", { name: "Để sau" }).click();
  await current(page).getByRole("button", { name: "Xong, về Hôm nay" }).click();
  await nav(page, "Hành trình").click();
  await expect(page.getByRole("heading", { name: "Hành trình của bạn" })).toBeVisible();
  await expect(current(page).locator(".mcy-snapshot-heading")).toContainText("Chuỗi Cổ và vai");
  await expect(current(page).locator(".mcy-snapshot-meta").first()).toContainText("Dễ chịu hơn");
  // The Chút memory holds counters only and never touches the guest journal key.
  const memory = await readJson(page, CHUT_KEY);
  expect(Object.keys(memory).sort()).toEqual(["autoAdvance", "invitesShown", "nextInviteAt", "sessions", "version"]);
  expect(memory.sessions).toBe(2);
});

test("the account invitation opens after the 2nd session, at most once per run, and not on the next session after Để sau", async ({ page }) => {
  await enterAsGuest(page);
  await sessionWithAnswer(page, "Lưng", "Như cũ");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await current(page).getByRole("button", { name: "Xong, về Hôm nay" }).click();

  await sessionWithAnswer(page, "Lưng", "Chưa rõ");
  const dialog = page.getByRole("dialog", { name: "Lưu cảm nhận và Hành trình của bạn" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Tạo tài khoản để lưu cảm nhận và Hành trình của bạn khi đổi điện thoại. Bạn vẫn xem bài mà không cần tài khoản.");
  await expect(dialog).toContainText("Xác minh bằng mã gửi qua email. Bạn xóa được tài khoản trong Cá nhân.");
  await expect(dialog.getByRole("button", { name: "Tạo tài khoản" })).toBeVisible();
  await dialog.getByRole("button", { name: "Để sau" }).click();
  await expect(dialog).toHaveCount(0);
  expect(await readJson(page, CHUT_KEY)).toMatchObject({ sessions: 2, invitesShown: 1, nextInviteAt: 5 });
  await current(page).getByRole("button", { name: "Xong, về Hôm nay" }).click();

  // A new app run: the 3rd session is inside the wait after "Để sau".
  await page.reload();
  await enterAsGuest(page);
  await sessionWithAnswer(page, "Lưng", "Như cũ");
  await expect(current(page).getByText("Cảm ơn bạn đã ghi lại.")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await readJson(page, CHUT_KEY)).toMatchObject({ sessions: 3, invitesShown: 1 });
});

test("Tạo tài khoản in the invitation opens account creation", async ({ page }) => {
  await page.addInitScript(key => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 1, sessions: 1, invitesShown: 0, nextInviteAt: 2, autoAdvance: true })); }, CHUT_KEY);
  await enterAsGuest(page);
  await sessionWithAnswer(page, "Toàn thân", "Khó chịu hơn");
  await page.getByRole("dialog").getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Tài khoản" })).toBeVisible();
});

test("the pain screen is fixed copy, makes no network call and offers only stop or the library", async ({ page }) => {
  await enterAsGuest(page);
  await page.waitForLoadState("networkidle");
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await current(page).getByRole("button", { name: "Tôi đang đau hoặc khó chịu" }).click();
  const pain = current(page).getByTestId("chut-pain");
  await expect(pain).toContainText("Câu cố định · không do AI viết");
  await expect(pain).toContainText("Nếu bạn đang đau hoặc khó chịu, hãy dừng lại và nghỉ. Mình không thay được người hướng dẫn.");
  await expect(pain).toContainText("Khi bạn đang đau hoặc khó chịu, Chút không chọn bài và không dùng AI. Nếu bạn cần hỗ trợ khẩn cấp, hãy liên hệ dịch vụ phù hợp tại nơi bạn đang ở.");
  await expect(pain).toContainText("Trong thư viện, bạn tự chọn. Chút không gợi ý bài lúc này.");
  expect(requests.filter(url => !url.startsWith("http://127.0.0.1"))).toEqual([]);
  expect(requests.filter(url => !/\.(js|css|woff2?|webp|png|svg)(\?|$)/.test(url))).toEqual([]);
  await pain.getByRole("button", { name: "Dừng ở đây" }).click();
  await expect(current(page).getByTestId("chut-card")).toBeVisible();

  await current(page).getByRole("button", { name: "Tôi đang đau hoặc khó chịu" }).click();
  await current(page).getByRole("button", { name: "Tự xem thư viện bài học" }).click();
  await expect(current(page).getByTestId("free-course-catalog")).toBeVisible();
});

test("a clip skipped with Bài tiếp is not counted as watched", async ({ page }) => {
  await stubYouTube(page);
  await enterAsGuest(page);
  await openRegion(page, "Hông và chân");
  const screen = current(page).locator("main");
  await screen.getByRole("switch", { name: /Tự chuyển sang bài tiếp/ }).click();
  await screen.getByRole("button", { name: /^Phát bài học/ }).click();
  await page.waitForFunction(() => Boolean((window as unknown as { __yt?: unknown }).__yt));
  for (const step of [1, 2]) {
    await screen.getByRole("button", { name: "Bài tiếp", exact: true }).click();
    await expect(screen.getByTestId("chut-progress")).toContainText(`Bài ${step + 1} trên 3`);
  }
  await playToEnd(page);
  const end = current(page).getByTestId("chut-end");
  await expect(end).toContainText("Bạn đã xem 1 trên 3 bài.");
  await expect(end).not.toContainText("Bạn vừa xem xong");
});

test("without the YouTube API the learner moves on and finishes with their own taps", async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/embed/**", route => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Embedded player fixture</title>" }));
  await page.route("https://www.youtube.com/iframe_api", route => route.abort());
  await enterAsGuest(page);
  await openRegion(page, "Hông và chân");
  const screen = current(page).locator("main");
  await screen.getByRole("button", { name: /^Phát bài học/ }).click();
  for (const step of [1, 2]) {
    await screen.getByRole("button", { name: "Bài tiếp", exact: true }).click();
    await expect(screen.getByTestId("chut-progress")).toContainText(`Bài ${step + 1} trên 3`);
  }
  await screen.getByRole("button", { name: "Xong chuỗi", exact: true }).click();
  await expect(current(page).getByTestId("chut-end")).toContainText("Bạn vừa xem xong 3 bài.");
});
