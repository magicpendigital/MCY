# Một chút Yoga — Product design system

**Status:** implementation-ready working system for the next build phase.  
**Brand:** Khoảng mở working mark · warm ivory / forest / terracotta · editorial serif + system sans.  
**Product experience:** daily check-in → short AI-assisted choice → concrete practice plan → practice → honest reflection → next choice.

## Source files

- `tokens.json` — platform-neutral token reference.
- `tokens.css` — CSS token source used by the prototype.
- `../brand/BRAND_GUIDELINES.md` — identity, voice, asset, and market status.
- `../brand/assets/` — SVG logo and app icon masters.
- `MOTION_SPEC.md` — timing, easing, triggers, sound, and reduced-motion behavior.
- `../analyse/MCY_BRAND_SYSTEM_HANDOFF_2026-09-26.html` — visual review and live motion samples.

## Foundations

### Layout and spacing

- Use the 4 px scale in `tokens.css`; prefer 8 / 12 / 16 / 24 / 32 px increments.
- Phone content uses 16–24 px horizontal inset according to viewport width. Keep fixed app chrome outside scrolling content.
- Give a screen one primary next action. Use a second action only where a meaningful alternative exists.
- Cards are for grouped content or an actionable choice, not every paragraph. Default card padding 16 px; feature card radius 24 px; routine card radius 16 px.
- Let images support an action or a practice preview. Avoid multiple decorative hero blocks on one screen.

### Type

- Editorial headings use the editorial serif token; body and controls use the platform sans token.
- Body copy: 14–16 px with 1.5 line height. Footnotes should remain at least 11 px and must not contain essential instructions.
- Page titles: 34–47 px on welcome, 28–36 px on standard pages, responsive to phone size.
- Maintain text reflow, allow longer Vietnamese labels to wrap, and never truncate a medical or user-entered detail without an explicit expansion affordance.

### Color and status

Use the semantic color tokens. Status is always conveyed by text or a shape/icon as well as color. Do not infer health state from palette, body-map artwork, or the user's visual body preference.

## Component contracts

| Component | Anatomy and behavior |
|---|---|
| App header | 55 px app toolbar below protected device status area; back affordance at left, centered short title; no duplicate device chrome |
| Bottom navigation | 4 destinations (Hôm nay, Hành trình, Khám phá, Hồ sơ); 68 px app-owned bar above protected safe area; label + icon; selected state includes a pale-sage container |
| Primary button | Terracotta, ivory text, 51–53 px minimum height, pill-like radius; one per decision step; disabled state keeps label readable |
| Secondary button | Paper surface, 1 px border, forest text; for a genuine alternate path |
| Choice chip | 42–48 px minimum height; explicit `aria-pressed`; selected state uses sage-soft fill + stronger border, not color alone |
| Text field | Paper surface, 46 px minimum, visible label, clear focus ring; use keyboard-aware runtime fields |
| Feature card | Photo or illustration, one heading, one sentence, optional short metadata; never compress a full user decision into a graphic-only card |
| Notice / helper | Text + small icon; neutral background; state the source and next step in plain language |
| Bottom sheet | Use the runtime component; preserve keyboard dismissal, phone portal, and safe-area behavior |
| Progress | Show actual current step or actual session progress. Never simulate progress just to fill load time |

## Product-specific interaction rules

- Check-in separates no discomfort, unsure, skip, and no response.
- Each body region holds its own self-report, side, level, and note; the text list remains available beside the body map.
- The recommendation states why it fits, lets the learner change it, and stays within content the teacher has confirmed.
- Reflection supports better, unchanged, worse, uncertain, omitted, and overall feeling. No response is not improvement.
- Journey presents actual dated records, preserves gaps, and compares like-for-like self-reports only. Sample history must remain labeled as sample.
- Practice controls and progress reflect real playback/session state; never autoplay audio or advance a pose without user control unless later research supports it.

## Accessibility and platform behavior

- Meet WCAG 2.2 AA as the release target. Check contrast, visible keyboard focus, screen-reader names, touch size, dynamic text, and reduced motion on iOS and Android.
- Aim for 44 × 44 pt iOS and 48 × 48 dp Android interactive targets; adjacent items may not overlap. See [Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) and [Android accessibility: Views](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views).
- System/device status bars, camera cutout, keyboard, navigation area, and home indicator remain owned by the mobile runtime.
- Honor OS reduced-motion preferences. Replace nonessential movement with instant state changes or a short opacity/color change; never hide information that motion would otherwise communicate.
- Keep action enabled and cancellable while decorative motion runs. Do not hold a user at an intro animation.

## Performance and asset rules

- Prefer small SVGs for the mark and UI icons; use raster images for photography and complex body art.
- Load hero photography responsively; defer below-the-fold imagery. Avoid re-encoding the same image into UI decorations.
- Animation is transform/opacity/stroke only; no large blur, parallax, continuous redraw, or permanent looping in the primary flow.
- Use the actual prototype route and phone runtime. Do not replace the calibrated device shell for app UI work.

## Handoff checklist for each feature

1. Name the screen's user goal and the data/state it reads and writes.
2. Define loading, empty, error, success, disabled, and reduced-motion states where applicable.
3. Confirm labels and actions remain understandable at 320 CSS px and in landscape.
4. Check iOS and Android device chrome, keyboard, safe areas, and screen reader order.
5. Check all outcomes honestly, including uncertainty and skipping.
6. Confirm proposed behavior with users before treating research hypotheses as product facts.
