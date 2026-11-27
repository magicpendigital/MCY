/**
 * Teacher-instructions email for an address that already has a Một chút yoga
 * account (Owner request 2026-11-27). Auth refuses to invite an existing
 * account, and the teacher workspace is a separate page from the learner app,
 * so the invitee needs plain steps. The email carries no sign-in token or link:
 * the button only opens the teacher workspace, where the invitee signs in with
 * their own verification email. Nothing typed by anyone is interpolated.
 * Colours and fonts follow supabase/templates/ (ivory, forest, terracotta CTA).
 */

export const TEACHER_WORKSPACE_URL = "https://motchutyoga.magicpendigital.com/?workspace=teacher";
export const TEACHER_INVITE_REDIRECT_URL = "https://motchutyoga.magicpendigital.com/auth/callback?workspace=teacher&email_locale=vi-VN";
export const TEACHER_INVITE_EMAIL_SUBJECT = "Lời mời làm giảng viên · Một chút yoga";

const STEPS = [
  "Bấm nút “Mở trang giảng viên” bên dưới. Trang này dành riêng cho giảng viên, khác với ứng dụng tập yoga.",
  "Nhập đúng địa chỉ email đã nhận thư này rồi bấm “Gửi liên kết xác minh”. Mở thư xác minh vừa nhận và bấm liên kết trong thư.",
  "Hệ thống tự nhận lời mời và mở phần soạn bài. Nếu trang báo cần tên hiển thị: mở ứng dụng Một chút yoga, vào Cá nhân, đặt tên hiển thị, rồi mở lại trang giảng viên.",
];

export function teacherInviteEmailText(): string {
  return [
    "Bạn được mời làm giảng viên",
    "",
    "Một chút yoga mời bạn soạn bài video với vai trò giảng viên. Email này đã có tài khoản Một chút yoga, nên bạn dùng chính tài khoản đó, không cần tạo tài khoản mới.",
    "",
    "Làm theo 3 bước trong vòng 72 giờ:",
    ...STEPS.map((step, index) => `${index + 1}. ${step}`),
    "",
    `Mở trang giảng viên: ${TEACHER_WORKSPACE_URL}`,
    "",
    "Thư này không chứa mã hay liên kết đăng nhập. Bạn chỉ đăng nhập bằng thư xác minh gửi tới chính email của mình.",
    "Nếu bạn không biết về lời mời này, hãy bỏ qua thư; tài khoản của bạn không thay đổi gì.",
    "",
    "Thư mời giảng viên · Một chút yoga · Magicpen Digital",
  ].join("\n");
}

export function teacherInviteEmailHtml(): string {
  const steps = STEPS.map((step, index) =>
    `<tr><td valign="top" style="padding:0 12px 12px 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#8E4B35">${index + 1}</td><td style="padding:0 0 12px">${step}</td></tr>`
  ).join("");
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Bạn được mời làm giảng viên</title></head>
<body style="margin:0;background:#FFFCF7;color:#283D31;font-family:Arial,Helvetica,sans-serif;line-height:1.6">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px"><tr><td style="padding:8px 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:24px">Một chút yoga</td></tr>
<tr><td style="padding:28px 24px;background:#FFFDF9;border:1px solid #E2E4DB;border-radius:16px"><h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;font-weight:400">Bạn được mời làm giảng viên</h1>
<p style="margin:0 0 16px">Một chút yoga mời bạn soạn bài video với vai trò giảng viên. Email này đã có tài khoản Một chút yoga, nên bạn dùng chính tài khoản đó, không cần tạo tài khoản mới.</p>
<p style="margin:0 0 12px;font-weight:600">Làm theo 3 bước trong vòng 72 giờ:</p>
<table role="presentation" cellspacing="0" cellpadding="0">${steps}</table>
<p style="margin:20px 0 28px"><a href="${TEACHER_WORKSPACE_URL}" style="display:inline-block;background:#8E4B35;color:#FFFCF7;padding:14px 24px;border-radius:24px;font-weight:600;text-decoration:none">Mở trang giảng viên</a></p>
<p style="margin:0;color:#56665A;font-size:14px">Thư này không chứa mã hay liên kết đăng nhập. Bạn chỉ đăng nhập bằng thư xác minh gửi tới chính email của mình.</p>
<p style="margin:16px 0 0;font-size:14px;color:#56665A">Nếu bạn không biết về lời mời này, hãy bỏ qua thư; tài khoản của bạn không thay đổi gì.</p></td></tr>
<tr><td style="padding-top:20px;color:#56665A;font-size:12px">Thư mời giảng viên · Một chút yoga · Magicpen Digital</td></tr></table>
</td></tr></table></body></html>`;
}

export type TeacherInviteEmailSender = (message: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) => Promise<boolean>;

const RESEND_TIMEOUT_MS = 10_000;

/**
 * Send through the Resend HTTP API. Returns true only on a 2xx answer; any
 * other answer, a timeout or a network error returns false, and the caller
 * treats the outcome as unconfirmed (never retried automatically). The API key
 * stays in this closure and is never logged or returned.
 */
export function createResendSender(apiKey: string, fetchImpl: typeof fetch = fetch): TeacherInviteEmailSender {
  return async message => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);
    try {
      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": message.idempotencyKey,
        },
        body: JSON.stringify({
          from: message.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
        signal: controller.signal,
      });
      await response.body?.cancel().catch(() => undefined);
      return response.status >= 200 && response.status < 300;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  };
}

/** A sender address like `Một chút yoga <no-reply@example.com>` or a bare address; no line breaks. */
export function validSenderAddress(value: string | undefined): string | null {
  const from = value?.trim();
  if (!from || from.length > 200 || /[\r\n\u0000-\u001f\u007f]/.test(from)) return null;
  if (!/^(?:[^<>@]+<[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/.test(from)) return null;
  return from;
}
