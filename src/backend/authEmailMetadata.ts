import { timeoutSignal } from '../compat';
import type { Session } from '@supabase/supabase-js';
import type { AppLocale } from '../i18n';

/** Cosmetic metadata only; a captured verified token determines the account. */
export async function syncEmailLocaleForSession(session: Session, locale: AppLocale, config: { url: string; publishableKey: string }): Promise<boolean> {
  if (!session.user.email_confirmed_at || !session.expires_at || session.expires_at <= Date.now() / 1000) return false;
  const userId = session.user.id, token = session.access_token;
  const timeout = timeoutSignal(2500);
  try {
    const response = await fetch(`${config.url}/auth/v1/user`, {
      method: 'PUT', headers: { apikey: config.publishableKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { locale } }), signal: timeout.signal,
    });
    if (!response.ok) return false;
    const user = await response.json() as { id?: unknown };
    return user.id === userId;
  } catch { return false; } finally { timeout.clear(); } // Preference failure never invalidates a completed sign-in.
}
