import { ExclamationTriangleIcon, HeartIcon, LockClosedIcon, PlayIcon, ReloadIcon } from "@radix-ui/react-icons";
import { msg } from "../../i18n";
import { MobileScroll } from "../../mobile";
import { hasStoredAuthSession } from "../../backend/supabase";
import { SESSION_RESTORE_RETRY_EVENT } from "../../app/events";
import { useDemo } from "../../app/state";
import { Brand } from "../../app/ui/Brand";

export function WelcomeScreen() {
  const { state } = useDemo();
  const locale = state.locale;
  const storedSession = hasStoredAuthSession();
  const restoreNote = storedSession && state.backendStatus === "loading"
    ? <section className="mcy-restore-card" role="status"><span className="mcy-restore-icon spinning" aria-hidden="true"><ReloadIcon /></span><div><strong>{msg(locale, "session.restoring")}</strong><p>{msg(locale, "session.restoringHint")}</p></div></section>
    : storedSession && state.backendStatus === "error"
      ? <section className="mcy-restore-card failed" role="alert"><span className="mcy-restore-icon" aria-hidden="true"><ExclamationTriangleIcon /></span><div><strong>{msg(locale, "session.restoreFailedTitle")}</strong><p>{msg(locale, "session.restoreFailed")}</p></div><button className="mcy-restore-retry" onClick={() => window.dispatchEvent(new Event(SESSION_RESTORE_RETRY_EVENT))}>{msg(locale, "session.retry")}</button></section>
      : null;
  return <MobileScroll className="mcy-scroll welcome"><main className="mcy-welcome">
    <img className="mcy-welcome-photo" src="/assets/welcome-portrait-1024.webp" srcSet="/assets/welcome-portrait-512.webp 512w, /assets/welcome-portrait-1024.webp 1024w" sizes="(min-width: 700px) 450px, 100vw" alt={locale === "en-US" ? "A woman resting on a yoga mat" : "Người ngồi thư giãn trên thảm yoga"} loading="eager" fetchPriority="high" decoding="async" />
    <div className="mcy-welcome-top"><Brand locale={locale} heading />{import.meta.env.DEV && <LocaleToggle />}<p>{msg(locale, "brand.slogan")}</p>{locale === "en-US" && <small className="mcy-slogan-note">{msg(locale, "brand.sloganNote")}</small>}</div>
    <div className="mcy-welcome-benefits"><div><span><PlayIcon /></span>{msg(locale, "welcome.benefit1")}</div><div><span><HeartIcon /></span>{msg(locale, "welcome.benefit2")}</div><div><span><LockClosedIcon /></span>{msg(locale, "welcome.benefit3")}</div></div>
    {restoreNote}
    <p className="mcy-welcome-quote">{msg(locale, "welcome.quote")}</p>
  </main></MobileScroll>;
}

function LocaleToggle() {
  const { state, update } = useDemo();
  const locale = state.locale;
  return <button className="mcy-language-toggle" aria-label={msg(locale, locale === "vi-VN" ? "locale.switchToEnglish" : "locale.switchToVietnamese")} onClick={() => update({ locale: locale === "vi-VN" ? "en-US" : "vi-VN" })}>{locale === "vi-VN" ? "VI / EN*" : "EN / VI"}</button>;
}
