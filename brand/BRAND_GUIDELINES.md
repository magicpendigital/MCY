# Một chút Yoga — Brand guidelines

**Version:** 1.0 working identity · 26 September 2026  
**Status:** Khoảng mở is the selected working mark for the current development phase. It is not a trademark clearance or a permanent lock-up approval.

## Brand core

- **Vietnam-facing name:** Một chút yoga
- **English-facing name:** A Little Yoga. The user selected this name on 27 September 2026. Validate comprehension and preference with English-speaking users before international launch.
- **Vietnamese slogan:** Vạn chút an yên. Corrected by the user on 27 September 2026, shortened from “Một chút yoga, vạn chút an yên”; supersedes the mistaken interim wording. Applied to the learner welcome UI and web metadata in the current prototype implementation.
- **English slogan:** A little more peace. The user selected this concise line on 27 September 2026. The rest of the English interface remains an incomplete internal preview and needs translation and editorial review before release.
- **Campaign invitation to test:** Make room for a little yoga.
- **Promise:** Help people find one fitting yoga practice for today and continue at a pace that feels their own.
- **Personality:** Calm, kind, grounded, quietly optimistic, clear, and never judgmental.

## Selected mark: Khoảng mở

The mark is an open, hand-drawn circular arc with a separate point. The open contour suggests making room; the point gives attention a place to rest. The idea is about a small intentional pause, rather than a literal person, pose, plant, or claim about an outcome.

### Master artwork and variants

- `assets/mark-forest.svg` — default mark on light surfaces.
- `assets/mark-ivory.svg` — reversed mark on dark forest surfaces.
- `assets/mark-terracotta.svg` — editorial accent use; do not use for long-form app navigation.
- `assets/logo-lockup-vi.svg` — Vietnamese wordmark lock-up.
- `assets/logo-lockup-vi-reversed.svg` — Vietnamese lock-up for dark backgrounds.
- `assets/logo-lockup-en.svg` — English hypothesis lock-up; use only in research and clearly marked concept material until validated.
- `assets/logo-lockup-en-reversed.svg` — English hypothesis lock-up for dark concept backgrounds.
- `assets/app-icon-master.svg` — square icon master with its own background.
- `assets/app-icon-foreground.svg` + `assets/app-icon-background.svg` — layered icon source for adaptive platform exports.
- `assets/favicon.svg` — heavier small-size drawing of the same geometry.

The arc and point are deliberately separate shapes. Keep their relative placement, opening direction, and visual weight. The SVG paths are the source artwork; do not trace them again for each placement. SVG wordmark `<text>` remains live text for editable previews. Outline the type only when exporting a fixed print asset, using the specified font and checking Vietnamese diacritics.

### Clear space and size

- Clear space on every side: at least the point's diameter (`x`) from the mark or lock-up.
- Standalone digital mark: 24 CSS px preferred; 18 px is the absolute minimum for the optical micro variant. Use the supplied `favicon.svg` below 24 px.
- Print mark: 8 mm preferred; 6 mm absolute minimum.
- Horizontal wordmark lock-up: 150 CSS px wide / 32 mm wide minimum. Below this, use the symbol alone.
- App icon: symbol only, no slogan or wordmark. Keep the artwork inside the central 66% safe zone; let the operating system apply its platform mask.

### Color and backgrounds

Default to forest ink on warm ivory or white. Use the ivory artwork on solid deep-forest backgrounds. Do not put the mark directly on photography unless a solid clear-space field protects contrast. Do not use the sage color for small text or thin logo lines on ivory; reserve soft sage for larger surfaces, illustrations, and low-priority states.

### Do

- Use the exact vector master and maintain its opening direction.
- Preserve one-color use for print, embossing, laser marking, and small UI.
- Pair the Vietnamese mark with the Vietnamese name as the default market expression.
- Use “A Little Yoga” and “A little more peace” as the selected English name and slogan. The campaign invitation remains a research candidate; broader international positioning still needs user validation.
- Use the mark as a quiet anchor in the welcome screen, app icon, teacher materials, and social avatars.

### Do not

- Close the arc, rotate it, stretch it, add leaves or a human silhouette, or move the point.
- Add glow, bevel, gradients, shadows, outlines, or a decorative enclosing ring to the mark.
- Use the mark as a continuous rotating loading spinner. Motion is a short reveal, not the permanent logo state.
- Put the slogan inside the app icon or use it at sizes where it becomes hard to read.
- imply that a practice cures pain or guarantees calm, flexibility, or improvement.

## Color system

| Token | Hex | Role |
|---|---|---|
| Canvas | `#FFFCF7` | Main warm-ivory app and campaign background |
| Surface | `#FFFDF9` | Cards, sheets, fields |
| Ink | `#283D31` | Main type, primary brand artwork |
| Forest | `#425D48` | Secondary controls, links, supporting emphasis |
| Forest dark | `#25372D` | Dense dark surfaces and reverse-mark background |
| Sage | `#A9C79D` | Large decorative accents and illustration details |
| Sage soft | `#E8EEE4` | Selected and informational surfaces |
| Terracotta | `#9A563E` | Small editorial accent and label |
| Action terracotta | `#8E4B35` | Primary action background with ivory text |
| Terracotta soft | `#F5E8DD` | Warm status and supporting surfaces |
| Muted text | `#56665A` | Secondary body copy |
| Border | `#E2E4DB` | Quiet separators and card edges |

`#8E4B35` with `#FFFCF7` has a 6.40:1 contrast ratio; forest `#425D48` with ivory has 7.10:1; muted text `#56665A` with ivory has 5.96:1. These are calculated color-pair values, not a substitute for checking actual text size, opacity, overlays, and states. Do not place small white copy on sage.

## Typography

- **Editorial headings and the wordmark treatment:** Georgia, then Times New Roman, then serif fallback. Use regular weight and compact line height. Keep Vietnamese marks unobstructed.
- **Interface text:** Roboto on Android, native system sans on iOS, with a sans-serif fallback. Use 400–700 weights; reserve heavier weights for labels and active states.
- **Number / practice timing:** interface sans by default; editorial serif can distinguish a single, prominent duration.
- Do not set long copy in all caps. Eyebrow labels may use uppercase with generous tracking.
- Do not depend on an unbundled custom font. This keeps the first app package lean and avoids font flashing. Revisit only after device checks.

## Photography and illustration

- Use natural window light, real home or studio spaces, uncluttered backgrounds, and candid pauses between movements.
- Favor warm neutral skin tones, visible room context, and a believable range of bodies, ages, and mobility.
- Avoid hard fitness lighting, glossy stock poses, exaggerated flexibility, body-transformation imagery, or claims expressed through before/after photography.
- Product body maps are explanatory illustrations, not brand decoration. Keep them neutral, accessible, and paired with text labels.

## Graphic language and voice

- Use generous margins, restrained borders, one hero image at a time, and a small number of choices per step.
- Use simple rounded line icons from one coherent library. Do not draw a second competing logo motif.
- Write warmly and specifically: “Bạn có khoảng 8 phút” rather than urgency, streak pressure, or a promise of improvement.
- Preserve “không thay đổi”, “khó chịu hơn”, “chưa rõ”, and “bỏ qua” as valid responses.
- The assistant explains why a content choice fits and allows the learner to adjust it. It does not diagnose.

## First application map

| Surface | Brand expression |
|---|---|
| App icon / avatar | Mark only, forest field with ivory mark |
| Welcome / splash | Vietnamese lock-up; one short arc-draw reveal, then static |
| Navigation | Small static forest mark or name; no looping movement |
| Teacher content cover | Editorial heading, calm photography, small corner mark |
| Social post | Ivory or forest background, one hero statement, clear lock-up |
| Email / printed handout | One-color logo, Georgia headline, sans body, broad margins |
| Loading | Use only while real work is pending; explain if meaningful, do not fake waiting |

## Validation before public launch

Test the mark in grayscale, at 18–24 px, at a distance in print, and among neighboring app icons. Ask unprompted users what they see and feel before explaining the open-space metaphor. Check wordmark pronunciation, Vietnamese character rendering, name availability, and trademark clearance. Validate “A Little Yoga” and “little” interpretation separately with English-speaking users.
