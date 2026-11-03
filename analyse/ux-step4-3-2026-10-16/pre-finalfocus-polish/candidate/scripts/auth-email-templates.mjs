import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const emailOrigins = ['https://motchutyoga.magicpendigital.com', 'http://localhost:5174', 'http://127.0.0.1:5174'];
export const emailRedirects = locale => emailOrigins.flatMap(origin => ['learner', 'owner', 'teacher'].map(workspace =>
  `${origin}/auth/callback?${workspace === 'learner' ? '' : `workspace=${workspace}&`}email_locale=${locale}`));
// RedirectTo is only a language hint. Identity/roles never come from a template.
export const localePreamble = `{{- $saved := printf "%v" .Data.locale -}}{{- $en := or (eq $saved "en-US") (eq $saved "en") -}}{{- $redirect := printf "%v" .RedirectTo -}}{{- if eq $redirect ${emailRedirects('en-US').map(v => JSON.stringify(v)).join(' ')} -}}{{- $en = true -}}{{- else if eq $redirect ${emailRedirects('vi-VN').map(v => JSON.stringify(v)).join(' ')} -}}{{- $en = false -}}{{- end -}}`;
const copy = (vi, en) => `{{ if $en }}${en}{{ else }}${vi}{{ end }}`;
// Security events have no initiating web redirect. Keep their stored-locale
// subjects below the Dashboard's 255-character template-source limit.
const savedLocalePreamble = `{{- $en := eq (printf "%v" .Data.locale) "en-US" "en" -}}`;
const ignored = ['Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email. Không chia sẻ mã hoặc liên kết xác minh.', 'If you did not request this, you can ignore this email. Keep verification codes and links private.'];
const security = ['Nếu bạn không thực hiện thay đổi này, hãy liên hệ người phụ trách ứng dụng qua kênh hỗ trợ bạn đang dùng. Không chia sẻ mã hoặc liên kết xác minh.', 'If you did not make this change, contact the application team through your usual support channel. Keep verification codes and links private.'];
export const scenarios = [
  { id: 'confirmation', kind: 'template', vi: ['Xác minh email của bạn', 'Xác minh email để tiếp tục tạo tài khoản Một chút yoga.', 'Xác minh email'], en: ['Confirm your email', 'Confirm your email to continue creating your A Little Yoga account.', 'Confirm email'], code: true },
  { id: 'magic_link', kind: 'template', vi: ['Liên kết đăng nhập của bạn', 'Bạn vừa yêu cầu đăng nhập Một chút yoga. Mở liên kết trên cùng trình duyệt hoặc thiết bị đã gửi yêu cầu để tiếp tục đúng phiên.', 'Đăng nhập'], en: ['Your sign-in link', 'You requested to sign in to A Little Yoga. Open the link in the same browser or device that requested it to continue your session.', 'Sign in'], code: true },
  { id: 'invite', kind: 'template', vi: ['Lời mời tạo tài khoản', 'Bạn được mời tạo tài khoản Một chút yoga. Xác nhận lời mời để tiếp tục. Quyền truy cập workspace được kiểm tra riêng sau khi đăng nhập.', 'Xác nhận lời mời'], en: ['Your account invitation', 'You have been invited to create an A Little Yoga account. Confirm the invitation to continue. Workspace access is checked separately after sign-in.', 'Accept invitation'] },
  { id: 'recovery', kind: 'template', vi: ['Xác minh yêu cầu đặt lại mật khẩu', 'Bạn vừa yêu cầu đặt lại mật khẩu tài khoản Một chút yoga. Dùng liên kết dưới đây để tiếp tục yêu cầu này.', 'Tiếp tục đặt lại mật khẩu'], en: ['Verify your password reset request', 'A password reset was requested for your A Little Yoga account. Use the link below to continue this request.', 'Continue password reset'] },
  { id: 'email_change', kind: 'template', vi: ['Xác nhận thay đổi email', 'Bạn vừa yêu cầu thay đổi email tài khoản Một chút yoga. Dùng liên kết dưới đây để xác nhận. Nếu hệ thống yêu cầu xác nhận ở cả hai hộp thư, hãy hoàn tất cả hai email.', 'Xác nhận thay đổi'], en: ['Confirm your email change', 'You requested to change the email for your A Little Yoga account. Use the link below to confirm. If confirmation is required in both inboxes, complete both emails.', 'Confirm email change'] },
  { id: 'reauthentication', kind: 'template', vi: ['Mã xác minh của bạn', 'Dùng mã dưới đây để xác minh lại trước khi tiếp tục thao tác trên tài khoản Một chút yoga. Chỉ nhập mã trong ứng dụng.', ''], en: ['Your verification code', 'Use the code below to verify your identity before continuing with your A Little Yoga account. Enter the code only in the application.', ''], code: true, codeOnly: true },
  ...[
    ['password_changed', 'Mật khẩu đã được thay đổi', 'Mật khẩu tài khoản Một chút yoga vừa được thay đổi.', 'Your password was changed', 'The password for your A Little Yoga account was changed.'],
    ['email_changed', 'Email tài khoản đã được thay đổi', 'Địa chỉ email tài khoản Một chút yoga vừa được thay đổi.', 'Your account email was changed', 'The email address for your A Little Yoga account was changed.'],
    ['phone_changed', 'Số điện thoại đã được thay đổi', 'Số điện thoại tài khoản Một chút yoga vừa được thay đổi.', 'Your phone number was changed', 'The phone number for your A Little Yoga account was changed.'],
    ['identity_linked', 'Đã thêm phương thức đăng nhập', 'Một phương thức đăng nhập vừa được liên kết với tài khoản Một chút yoga.', 'A sign-in method was added', 'A sign-in method was linked to your A Little Yoga account.'],
    ['identity_unlinked', 'Đã gỡ phương thức đăng nhập', 'Một phương thức đăng nhập vừa được gỡ khỏi tài khoản Một chút yoga.', 'A sign-in method was removed', 'A sign-in method was removed from your A Little Yoga account.'],
    ['mfa_factor_enrolled', 'Đã thêm phương thức xác minh', 'Một phương thức xác minh vừa được thêm vào tài khoản Một chút yoga.', 'A verification method was added', 'A verification method was added to your A Little Yoga account.'],
    ['mfa_factor_unenrolled', 'Đã gỡ phương thức xác minh', 'Một phương thức xác minh vừa được gỡ khỏi tài khoản Một chút yoga.', 'A verification method was removed', 'A verification method was removed from your A Little Yoga account.'],
  ].map(([id, titleVi, textVi, titleEn, textEn]) => ({ id, kind: 'notification', vi: [titleVi, textVi, ''], en: [titleEn, textEn, ''] })),
];

export function subjectFor(s) { return (s.kind === 'notification' ? savedLocalePreamble : localePreamble) + copy(`${s.vi[0]} · Một chút yoga`, `${s.en[0]} · A Little Yoga`); }
export function bodyFor(s) {
  const button = s.kind === 'template' && !s.codeOnly ? `<p style="margin:28px 0"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#8E4B35;color:#FFFCF7;padding:14px 24px;border-radius:24px;font-weight:600;text-decoration:none">${copy(s.vi[2], s.en[2])}</a></p>` : '';
  const code = s.code ? `<p style="margin:24px 0 8px;color:#56665A">${copy('Mã xác minh (nếu ứng dụng yêu cầu):', 'Verification code (if requested by the application):')}</p><p style="margin:0;font-size:28px;letter-spacing:4px;font-weight:600">{{ .Token }}</p>` : '';
  const details = s.kind === 'template' ? `<p style="color:#56665A;font-size:14px">${copy('Mã hoặc liên kết chỉ dùng một lần và có thời hạn. Nếu đã hết hạn, hãy yêu cầu email mới trong ứng dụng.', 'The code or link can be used once and expires. If it has expired, request a new email in the application.')}</p>` : '';
  return `${s.kind === 'notification' ? savedLocalePreamble : localePreamble}<!doctype html>
<html lang="{{ if $en }}en{{ else }}vi{{ end }}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${copy(s.vi[0], s.en[0])}</title></head>
<body style="margin:0;background:#FFFCF7;color:#283D31;font-family:Arial,Helvetica,sans-serif;line-height:1.6">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px"><tr><td style="padding:8px 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:24px">${copy('Một chút yoga', 'A Little Yoga')}</td></tr>
<tr><td style="padding:28px 24px;background:#FFFDF9;border:1px solid #E2E4DB;border-radius:16px"><h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;font-weight:400">${copy(s.vi[0], s.en[0])}</h1>
<p style="margin:0">${copy(s.vi[1], s.en[1])}</p>${button}${code}${details}
<p style="margin:24px 0 0;font-size:14px;color:#56665A">${copy(...(s.kind === 'notification' ? security : ignored))}</p></td></tr>
<tr><td style="padding-top:20px;color:#56665A;font-size:12px">${copy('Email xác minh và bảo mật tài khoản · Một chút yoga', 'Account verification and security email · A Little Yoga')}</td></tr></table>
</td></tr></table></body></html>\n`;
}

export function generate() {
  const directory = new URL('../supabase/templates/', import.meta.url); mkdirSync(directory, { recursive: true });
  const manifest = { schemaVersion: 1, fallbackLocale: 'vi-VN', supportedLocales: ['vi-VN', 'en-US'], scenarios: [] };
  for (const s of scenarios) {
    const filename = `${s.id}${s.kind === 'notification' ? '_notification' : ''}.html`;
    const body = bodyFor(s); writeFileSync(new URL(filename, directory), body);
    manifest.scenarios.push({ id: s.id, kind: s.kind, subject: subjectFor(s), contentPath: `./supabase/templates/${filename}`, sha256: createHash('sha256').update(body).digest('hex') });
  }
  writeFileSync(new URL('manifest.json', directory), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const manifest = generate(); console.log(JSON.stringify({ status: 'GENERATED', scenarios: manifest.scenarios.length, locales: manifest.supportedLocales, cloudMutation: false }));
}
