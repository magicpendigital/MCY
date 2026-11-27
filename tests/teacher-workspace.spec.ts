import { expect, test, type Page, type Route } from "@playwright/test";

const teacherId = "22222222-2222-4222-8222-222222222222";
const sessionId = "44444444-4444-4444-8444-444444444444";
const versionId = "55555555-5555-4555-8555-555555555555";
const accountEmail = "teacher@example.test";
const testSupabaseUrl = "https://mcy-playwright.invalid";

function createSession(userId = teacherId, accessToken = "fictional-test-access-token") {
  return {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "fictional-test-refresh-token",
    user: {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: accountEmail,
      email_confirmed_at: "2026-09-01T00:00:00Z",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      identities: [],
      created_at: "2026-09-01T00:00:00Z",
    },
  };
}

async function seedSession(page: Page) {
  await page.addInitScript(session => {
    localStorage.setItem("sb-mcy-playwright-auth-token", JSON.stringify(session));
  }, createSession());
}

test.beforeEach(async ({ page }) => {
  await page.route("https://*.supabase.co/**", route => route.abort("blockedbyclient"));
});

async function fulfill(route: Route, status: number, payload: unknown) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(payload) });
}

test("teacher access remains invite-only and draft create/read/update are server-backed", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await seedSession(page);

  let invitationAccepted = false;
  let draftPayload: Record<string, unknown> | null = null;
  let version = 0;
  const invocations: Array<Record<string, unknown>> = [];
  await page.route(`${testSupabaseUrl}/functions/v1/teacher-control-plane`, async route => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    invocations.push(body);
    if (body.action === "list_drafts") {
      if (!invitationAccepted) return await fulfill(route, 403, { error: "workspace_access_required" });
      const draft = draftPayload as Record<string, unknown> | null;
      return await fulfill(route, 200, { drafts: draft ? [{
        session_id: sessionId,
        version_id: versionId,
        version_no: version,
        title: draft.title,
        locale: "vi-VN",
        status: "draft",
        updated_at: "2026-10-02T00:00:00Z",
      }] : [] });
    }
    if (body.action === "accept_invite") {
      invitationAccepted = true;
      return await fulfill(route, 200, { status: "active" });
    }
    if (body.action === "save_draft") {
      draftPayload = body.draft as Record<string, unknown>;
      version += 1;
      return await fulfill(route, 200, { draft: {
        session_id: sessionId,
        version_id: versionId,
        version_no: version,
        title: draftPayload.title,
        locale: "vi-VN",
        status: "draft",
        updated_at: "2026-10-02T00:01:00Z",
      } });
    }
    if (body.action === "read_draft") {
      return await fulfill(route, 200, { draft: {
        ...(draftPayload ?? {}),
        session_id: sessionId,
        expected_version: version,
        version_id: versionId,
        version_no: version,
        locale: "vi-VN",
        status: "draft",
        updated_at: "2026-10-02T00:01:00Z",
      } });
    }
    return await fulfill(route, 400, { error: "unsupported_action" });
  });

  await page.goto("/?workspace=teacher");
  await page.getByRole("button", { name: "Kịch bản nháp", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Bài học của bạn." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tạo bản nháp" }).first()).toBeVisible();
  expect(invocations.slice(0, 3).map(item => item.action)).toEqual(["list_drafts", "accept_invite", "list_drafts"]);

  await page.getByRole("button", { name: "Tạo bản nháp" }).first().click();
  await page.getByLabel("Tiêu đề bài học").fill("Thả lỏng vai sau giờ làm");
  await page.getByLabel("Tóm tắt").fill("Một khoảng thực hành nhẹ nhàng trong ngày.");
  await page.getByLabel("Mục tiêu học tập").fill("Lắng nghe cảm giác của cơ thể.");
  await page.getByLabel("Chuyển động").fill("Xoay vai nhẹ");
  await page.getByLabel("Lời hướng dẫn").fill("Di chuyển trong khoảng thoải mái.");
  await page.getByRole("button", { name: "Lưu bản nháp riêng" }).click();
  await expect(page.getByRole("status")).toContainText("Bản nháp riêng đã được lưu");
  expect(draftPayload?.locale).toBe("vi-VN");
  expect(draftPayload?.duration_seconds).toBe(300);
  expect(draftPayload?.expected_version).toBeNull();
  expect(draftPayload?.segments).toMatchObject([{ position: 1, start_ms: 0, end_ms: 60_000, movement_name: "Xoay vai nhẹ" }]);

  await page.getByRole("button", { name: /Thả lỏng vai sau giờ làm/ }).first().click();
  await expect(page.getByLabel("Tiêu đề bài học")).toHaveValue("Thả lỏng vai sau giờ làm");
  await page.getByLabel("Tóm tắt").fill("Tóm tắt đã được biên tập lại.");
  await page.getByRole("button", { name: "Lưu bản nháp riêng" }).click();
  await expect(page.getByRole("status")).toContainText("Bản nháp riêng đã được lưu");
  expect(draftPayload?.expected_version).toBe(1);
  expect(version).toBe(2);

  const saveButton = page.getByRole("button", { name: "Lưu bản nháp riêng" });
  await page.getByLabel("Chuyển động").scrollIntoViewIfNeeded();
  await expect(saveButton).toBeInViewport();
  if (process.env.MCY_CAPTURE_STICKY_TEACHER_DESKTOP_SCREENSHOT === "true") {
    await page.screenshot({ path: "test-results/screenshots/teacher-workspace/run-05/teacher-workspace-desktop-sticky-save.png" });
  }

  const layout = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    editor: document.querySelector(".teacher-editor")?.getBoundingClientRect().width ?? 0,
  }));
  expect(layout.width).toBeLessThanOrEqual(layout.viewport);
  expect(layout.editor).toBeGreaterThan(600);
  expect(invocations.every(item => !("actor_id" in item))).toBe(true);
  expect(invocations.some(item => item.action === "upload_media" || item.action === "publish")).toBe(false);
  if (process.env.MCY_CAPTURE_TEACHER_SCREENSHOTS === "true") {
    await page.getByRole("button", { name: "Lưu bản nháp riêng" }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: "test-results/screenshots/teacher-workspace/teacher-workspace-editor-save.png", fullPage: true });
    await page.locator(".teacher-shell").evaluate(element => element.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: "test-results/screenshots/teacher-workspace/teacher-workspace-desktop.png", fullPage: true });
  }
});

test("teacher workspace denies a verified account without an invite and fits a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await seedSession(page);
  await page.route(`${testSupabaseUrl}/functions/v1/teacher-control-plane`, async route => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    if (body.action === "list_drafts" || body.action === "accept_invite") return await fulfill(route, 403, { error: "workspace_access_required" });
    return await fulfill(route, 400, { error: "unsupported_action" });
  });

  await page.goto("/?workspace=teacher");
  await expect(page.getByRole("heading", { name: "Chưa có lời mời giáo viên." })).toBeVisible();
  await expect(page.getByText(/Email đã xác minh không tự cấp quyền giáo viên/)).toBeVisible();
  await expect(page.locator(".teacher-primary")).toHaveCount(0);
  const brandHeight = await page.locator(".teacher-brand > span").evaluate(element => element.getBoundingClientRect().height);
  expect(brandHeight).toBeLessThan(32);
  await expect(page.getByRole("link", { name: "Mở ứng dụng học viên" })).toBeVisible();
  const layout = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(layout.width).toBeLessThanOrEqual(layout.viewport);
  if (process.env.MCY_CAPTURE_TEACHER_SCREENSHOTS === "true") {
    await page.screenshot({ path: "test-results/screenshots/teacher-workspace/teacher-workspace-mobile-denied.png", fullPage: true });
  }
});

test("invited teacher can save from the long form on a short, narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await seedSession(page);
  let invitationAccepted = false;
  await page.route(`${testSupabaseUrl}/functions/v1/teacher-control-plane`, async route => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    if (body.action === "list_drafts") {
      return await fulfill(route, invitationAccepted ? 200 : 403, invitationAccepted ? { drafts: [] } : { error: "workspace_access_required" });
    }
    if (body.action === "accept_invite") {
      invitationAccepted = true;
      return await fulfill(route, 200, { status: "active" });
    }
    return await fulfill(route, 400, { error: "unsupported_action" });
  });

  await page.goto("/?workspace=teacher");
  await page.getByRole("button", { name: "Kịch bản nháp", exact: true }).click();
  await page.getByRole("button", { name: "Tạo bản nháp" }).first().click();
  await expect(page.getByLabel("Tiêu đề bài học")).toBeVisible();
  const layout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(layout.width).toBeLessThanOrEqual(layout.viewport);
  const saveButton = page.getByRole("button", { name: "Lưu bản nháp riêng" });
  await page.getByLabel("Chuyển động").scrollIntoViewIfNeeded();
  await expect(page.getByLabel("Chuyển động")).toBeInViewport();
  await expect(saveButton).toBeInViewport();
  const savePosition = await saveButton.boundingBox();
  expect(savePosition?.y).toBeGreaterThanOrEqual(0);
  expect((savePosition?.y ?? Number.POSITIVE_INFINITY) + (savePosition?.height ?? 0)).toBeLessThanOrEqual(568);
  if (process.env.MCY_CAPTURE_STICKY_TEACHER_SCREENSHOT === "true") {
    await page.screenshot({ path: "test-results/screenshots/teacher-workspace/run-05/teacher-workspace-mobile-sticky-save.png" });
  }

  await page.setViewportSize({ width: 568, height: 320 });
  await page.getByLabel("Chuyển động").scrollIntoViewIfNeeded();
  await expect(page.getByLabel("Chuyển động")).toBeInViewport();
  await expect(saveButton).toBeInViewport();
  const landscapeSavePosition = await saveButton.boundingBox();
  expect(landscapeSavePosition?.y).toBeGreaterThanOrEqual(0);
  expect((landscapeSavePosition?.y ?? Number.POSITIVE_INFINITY) + (landscapeSavePosition?.height ?? 0)).toBeLessThanOrEqual(320);
  const landscapeLayout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(landscapeLayout.width).toBeLessThanOrEqual(landscapeLayout.viewport);
});

test("teacher editor preserves local text on a version conflict and reloads only after an explicit choice", async ({ page }) => {
  await seedSession(page);
  let reads = 0;
  await page.route(`${testSupabaseUrl}/functions/v1/teacher-control-plane`, async route => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    if (body.action === "list_drafts") return await fulfill(route, 200, { drafts: [{
      session_id: sessionId,
      version_id: versionId,
      version_no: 1,
      title: "Bài học đã lưu",
      locale: "vi-VN",
      status: "draft",
      updated_at: "2026-10-02T00:00:00Z",
    }] });
    if (body.action === "read_draft") {
      reads += 1;
      return await fulfill(route, 200, { draft: {
        session_id: sessionId,
        expected_version: reads === 1 ? 1 : 2,
        version_id: versionId,
        version_no: reads === 1 ? 1 : 2,
        locale: "vi-VN",
        status: "draft",
        updated_at: reads === 1 ? "2026-10-02T00:00:00Z" : "2026-10-02T00:02:00Z",
        title: "Bài học đã lưu",
        summary: reads === 1 ? "Tóm tắt ban đầu." : "Bản mới được lưu ở phiên khác.",
        objective: "Mục tiêu đã lưu.",
        level: "Cơ bản",
        intensity: "Nhẹ",
        pace: "Chậm",
        instruction_density: "Vừa phải",
        duration_seconds: 300,
        props: [],
        space_requirement: "",
        floor_contact: "",
        positions: [],
        learning_focus: [],
        segments: [{ position: 1, start_ms: 0, end_ms: 60_000, movement_name: "Xoay vai", cue_text: "Đi chậm.", stop_cue: "Dừng nếu khó chịu.", breath_cue: "Thở tự nhiên.", variant_ref: "" }],
      } });
    }
    if (body.action === "save_draft") return await fulfill(route, 409, { error: "workspace_conflict" });
    return await fulfill(route, 400, { error: "unsupported_action" });
  });

  await page.goto("/?workspace=teacher");
  await page.getByRole("button", { name: "Kịch bản nháp", exact: true }).click();
  await page.getByRole("button", { name: /Bài học đã lưu/ }).click();
  await page.getByLabel("Tóm tắt").fill("Thay đổi cục bộ chưa lưu.");
  await page.getByRole("button", { name: "Lưu bản nháp riêng" }).click();
  await expect(page.getByRole("alert")).toContainText("được cập nhật ở nơi khác");
  await expect(page.getByLabel("Tóm tắt")).toHaveValue("Thay đổi cục bộ chưa lưu.");
  await page.getByRole("button", { name: "Tải phiên bản đã lưu" }).click();
  await expect(page.getByLabel("Tóm tắt")).toHaveValue("Bản mới được lưu ở phiên khác.");
  await expect(page.locator(".teacher-editor-heading")).toContainText("PHIÊN BẢN 2");
});

test("teacher draft-save quota explains the limit and keeps unsaved work visible", async ({ page }) => {
  await seedSession(page);
  let invitationAccepted = false;
  await page.route(`${testSupabaseUrl}/functions/v1/teacher-control-plane`, async route => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    if (body.action === "list_drafts") {
      return await fulfill(route, invitationAccepted ? 200 : 403, invitationAccepted ? { drafts: [] } : { error: "workspace_access_required" });
    }
    if (body.action === "accept_invite") {
      invitationAccepted = true;
      return await fulfill(route, 200, { status: "active" });
    }
    if (body.action === "save_draft") return await fulfill(route, 429, { error: "draft_save_limit_reached" });
    return await fulfill(route, 400, { error: "unsupported_action" });
  });

  await page.goto("/?workspace=teacher");
  await page.getByRole("button", { name: "Kịch bản nháp", exact: true }).click();
  await page.getByRole("button", { name: "Tạo bản nháp" }).first().click();
  await page.getByLabel("Tiêu đề bài học").fill("Thực hành ngắn trong ngày");
  await page.getByLabel("Chuyển động").fill("Xoay vai nhẹ");
  await page.getByRole("button", { name: "Lưu bản nháp riêng" }).click();
  await expect(page.getByRole("alert")).toContainText("giới hạn 20 lần lưu trong 24 giờ");
  await expect(page.getByLabel("Tiêu đề bài học")).toHaveValue("Thực hành ngắn trong ngày");
});

test("a late draft read cannot replace the workspace after the signed-in account changes", async ({ page }) => {
  await seedSession(page);
  let releaseRead: (() => void) | undefined;
  let markReadStarted: (() => void) | undefined;
  const readStarted = new Promise<void>(resolve => { markReadStarted = resolve; });
  const delayedRead = new Promise<void>(resolve => { releaseRead = resolve; });

  await page.route(`${testSupabaseUrl}/functions/v1/teacher-control-plane`, async route => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    const authorization = route.request().headers().authorization ?? "";
    if (body.action === "list_drafts" && authorization.endsWith("fictional-test-access-token")) {
      return await fulfill(route, 200, { drafts: [{
        session_id: sessionId,
        version_id: versionId,
        version_no: 1,
        title: "Bản nháp riêng của tài khoản A",
        locale: "vi-VN",
        status: "draft",
        updated_at: "2026-10-02T00:00:00Z",
      }] });
    }
    if (body.action === "read_draft") {
      markReadStarted?.();
      await delayedRead;
      return await fulfill(route, 200, { draft: {
        session_id: sessionId,
        expected_version: 1,
        version_id: versionId,
        version_no: 1,
        locale: "vi-VN",
        status: "draft",
        updated_at: "2026-10-02T00:00:00Z",
        title: "Bản nháp riêng của tài khoản A",
        summary: "Thông tin chỉ thuộc tài khoản A.",
        objective: "Mục tiêu đã lưu.",
        level: "Cơ bản",
        intensity: "Nhẹ",
        pace: "Chậm",
        instruction_density: "Vừa phải",
        duration_seconds: 300,
        props: [],
        space_requirement: "",
        floor_contact: "",
        positions: [],
        learning_focus: [],
        segments: [{ position: 1, start_ms: 0, end_ms: 60_000, movement_name: "Xoay vai", cue_text: "Đi chậm.", stop_cue: "Dừng nếu khó chịu.", breath_cue: "Thở tự nhiên.", variant_ref: "" }],
      } });
    }
    if (body.action === "list_drafts" && authorization.endsWith("fictional-account-b-token")) {
      return await fulfill(route, 403, { error: "workspace_access_required" });
    }
    if (body.action === "accept_invite") return await fulfill(route, 403, { error: "workspace_access_required" });
    return await fulfill(route, 400, { error: "unsupported_action" });
  });

  await page.goto("/?workspace=teacher");
  await page.getByRole("button", { name: "Kịch bản nháp", exact: true }).click();
  await page.getByRole("button", { name: /Bản nháp riêng của tài khoản A/ }).click();
  await readStarted;

  await page.evaluate(nextSession => {
    const key = "sb-mcy-playwright-auth-token";
    localStorage.setItem(key, JSON.stringify(nextSession));
    const channel = new BroadcastChannel(key);
    channel.postMessage({ event: "SIGNED_IN", session: nextSession });
    channel.close();
  }, createSession("77777777-7777-4777-8777-777777777777", "fictional-account-b-token"));

  await expect(page.getByRole("heading", { name: "Chưa có lời mời giáo viên." })).toBeVisible();
  releaseRead?.();
  await expect(page.getByLabel("Tiêu đề bài học")).toHaveCount(0);
  await expect(page.getByText("Thông tin chỉ thuộc tài khoản A.")).toHaveCount(0);
});

test("teacher sign-in asks Auth not to create an account", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.route("**/auth/v1/otp", async route => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    expect(payload.create_user).toBe(false);
    expect(new URL(route.request().url()).searchParams.get("redirect_to")).toContain("workspace=teacher");
    await fulfill(route, 200, { message_id: "fictional-message" });
  });
  await page.route("**/auth/v1/**", async route => await fulfill(route, 200, {}));
  await page.goto("/?workspace=teacher");
  await expect(page.getByLabel("Email tài khoản")).toBeVisible();
  if (process.env.MCY_CAPTURE_TEACHER_SCREENSHOTS === "true") {
    await page.screenshot({ path: "test-results/screenshots/teacher-workspace/teacher-workspace-sign-in.png", fullPage: true });
  }
  await page.getByLabel("Email tài khoản").fill(accountEmail);
  await page.getByRole("button", { name: "Gửi liên kết xác minh" }).click();
  await expect(page.getByRole("status")).toContainText("liên kết xác minh đã được gửi");
});
