import type { AppLocale } from '../i18n';
import { Capacitor } from '@capacitor/core';
export function EmailLanguageSelect({ value, onChange, disabled = false }: { value: AppLocale; onChange: (value: AppLocale) => void; disabled?: boolean }) {
  if (Capacitor.isNativePlatform()) return <p style={{ color: '#56665A', fontSize: 14 }}>Email dùng ngôn ngữ đã lưu của tài khoản. Để đổi, chọn ngôn ngữ email khi đăng nhập trên web.</p>;
  return <label style={{ display: 'grid', gap: 6, margin: '16px 0', color: '#283D31', fontSize: 14 }}>
    Ngôn ngữ email / Email language
    <select aria-label="Ngôn ngữ email / Email language" value={value} disabled={disabled} onChange={event => onChange(event.target.value === 'en-US' ? 'en-US' : 'vi-VN')} style={{ width: '100%', minHeight: 46, padding: '10px 12px', border: '1px solid #E2E4DB', borderRadius: 12, background: '#FFFDF9', color: '#283D31', font: 'inherit' }}>
      <option value="vi-VN">Tiếng Việt</option><option value="en-US">English</option>
    </select>
  </label>;
}
