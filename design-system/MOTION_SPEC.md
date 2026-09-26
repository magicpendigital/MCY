# Motion specification — Một chút Yoga

Motion should make a change easier to follow, then get out of the way. Use the durations and curves from `tokens.css`; keep most app feedback under 200 ms. The logo remains static after it resolves. Follow the platform motion preference and preserve the same information without animation.

## Branded logo reveal concepts

These are production-ready animation briefs. Use Concept A in the app; retain B and C as optional campaign treatments until motion and sound are user-tested. Do not play a 3–6 second ident during routine app launch.

### A. Make room — app reveal and brand ident

**Duration:** 3.2 s for optional video/brand ident; resolve the app lock-up within 960 ms.  
**Easing:** `cubic-bezier(0.2, 0.7, 0.2, 1)` for the arc; standard ease for wordmark opacity.  
**Sound:** optional, one soft felt/wood tap at point arrival around 0.62 s; no breath sample or sound required. Keep default silent.

| Time | Picture / action |
|---|---|
| 0.00–0.12 s | Warm-ivory ground is already visible. No fade from black. |
| 0.12–0.62 s | Open arc draws once, from its upper-right tip around toward its lower-right tip; the gap remains open. Use SVG stroke-dash reveal. |
| 0.56–0.78 s | The detached point appears with a short opacity fade and 0.94→1 scale. Do not bounce. |
| 0.78–0.96 s | In the app splash only, the lock-up wordmark fades in. The app may continue as soon as the actual route is ready. |
| 1.18–3.20 s | Optional campaign hold. The mark is still. Any slogan appears below the wordmark, not inside the mark. |

**Reduced motion:** show the complete logo immediately; omit scale.  
**Sound mix:** one quiet, short cue, peak below the accompanying voice; no loop.  
**Implementation note:** one `pathLength`/stroke-dash animation and one dot opacity/scale animation; no canvas, filter, or frame-by-frame asset.

### B. A pause, then a point — campaign lock-up

**Duration:** 3.6 s. **Easing:** same emphasized curve; keep the hold static. **Sound:** optional soft chime when the wordmark resolves at 1.25 s.

| Time | Picture / action |
|---|---|
| 0.00–0.50 s | Arc draws to roughly 70%, leaving the visual gap obvious. |
| 0.50–0.95 s | Arc completes, easing softly to rest. |
| 0.95–1.20 s | Point fades in without translation. |
| 1.20–1.70 s | Vietnamese wordmark fades in; slogan follows after a 120 ms delay. |
| 1.70–3.60 s | Quiet still hold for social, film title, or teacher content. |

Use the slogan “Một chút yoga, vạn chút an yên”. For English work, label the name and line as a research hypothesis.

### C. Open on the word — content intro

**Duration:** 3.0 s. **Easing:** standard ease for text; emphasized curve for the arc. **Sound:** optional fabric/room tone only; avoid a breath sound that might feel instructive.

| Time | Picture / action |
|---|---|
| 0.00–0.45 s | A short wordmark line appears: “Dành một khoảng cho mình”. |
| 0.45–1.05 s | The arc draws beside the line; its open side points toward the copy. |
| 1.05–1.35 s | Point appears; copy settles to final position with no scaling. |
| 1.35–3.00 s | Brand lock-up and a still hold; transition directly to the first content image. |

This is for a campaign or course intro. Do not repeat it inside app navigation.

## App interaction motion

| State change | Default behavior | Reduced motion / notes |
|---|---|---|
| Primary / secondary button press | 100–140 ms subtle press feedback (`scale(0.985)`); restore as soon as released | No scale; use a brief color or border change |
| Choice / energy selection | 140 ms fill and border transition; do not animate choice order or layout | Immediate selected state; `aria-pressed` is authoritative |
| Body-map region selection | 160 ms marker ring opacity/size emphasis, one time | Immediate marker and text update; do not pulse repeatedly |
| Route change | Use FlowStack's existing transition only; do not add a second app-wide animation | Prefer instant or opacity-only transition if runtime supports the OS preference |
| Sheet open/close | Use the protected BottomSheet component's native motion and keyboard rules | Preserve component behavior; test OS reduced motion before production |
| Practice progress | Advance from actual session state; smooth only the short indicator update | Render directly to actual progress; pause remains user controlled |
| Success confirmation | Brief check/label appearance, no confetti or repeated celebration | Static confirmation and text |

## Loading policy

- Do not play a looping logo, rotating arc, breathing pulse, or fabricated percentage.
- For an actual network wait, first show immediate structure or a concise status. After roughly 300 ms, reveal a small static brand mark next to “Đang tải…” only if the activity is still pending.
- If content can be represented by a stable skeleton, prefer it over an indefinite spinner. Remove it when the real content/error arrives.
- If a real task can take longer, state what is happening, allow cancel/retry where meaningful, and announce status to assistive technology.
- Do not make the opening arc resemble an indeterminate spinner; the arc draws for 760 ms and the full lock-up resolves within 960 ms in-app.

## Timing and accessibility acceptance

- No nonessential animation blocks a tap, back action, or screen-reader announcement.
- Every selected / loading / success state has a text or semantic state in addition to motion and color.
- Respect iOS Reduce Motion, Android/system animation preferences, and `prefers-reduced-motion` on web surfaces.
- Keep repeated motion out of common paths. If the same motion occurs several times per session, remove or shorten it after usability review.
- Verify on lower-power devices, screen readers, and reduced-motion settings before release.

Motion guidance references: [Apple Human Interface Guidelines — Motion](https://developer.apple.com/design/human-interface-guidelines/motion), [W3C WAI — Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions), [W3C CSS technique for reduced motion](https://www.w3.org/WAI/WCAG22/Techniques/css/C39).
