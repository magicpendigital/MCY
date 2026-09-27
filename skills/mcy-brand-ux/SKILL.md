---
name: mcy-brand-ux
description: Design or review MCY learner-facing screens, copy, localization, body check-in, lesson media, and visual assets against the current brand and product loop. Use for MCY UI/UX work, not for unrelated Nilaza products.
---

# MCY brand and UX

Before making a visual or copy decision, read the current `AGENTS.md`, `brand/BRAND_GUIDELINES.md`, `design-system/DESIGN_SYSTEM.md`, `design-system/tokens.json`, and relevant user-provided visual reference. Read `design-system/MOTION_SPEC.md` when changing animation. Read dated `analyse/` files for rationale, then resolve any conflict by the latest explicit user decision and current handoff. Do not embed a second copy of logo, slogan, token values or provider facts in this skill.

Preserve the daily path: check-in → short conversation → today's practice → practice → honest reflection → next choice. Until a separate real-AI gate is approved, the conversation in the prototype remains a clearly labeled script/sample. Make the next action clear while keeping optional sample/skip/account controls distinct. Region points and text list both need to work; “no discomfort”, “unsure”, “skip” and no selection have different meanings. Never turn missing feedback into positive progress or describe yoga as curing a condition.

The current Vietnamese name and slogan are **Một chút yoga** and **Vạn chút an yên**; the selected English name and slogan are **A Little Yoga** and **A little more peace**. Do not append the brand name to either compact slogan. Khoảng mở is the current working mark and its open-arc/point geometry must stay consistent in app icon, splash and app UI. Broader English product copy and campaign positioning still need localization and user review.

The profile already has a locale field. The prototype's English option is a partial internal preview of the main learner loop, not a complete public translation: consent, account, support and Journey remain Vietnamese and should be disclosed where English preview is available. Keep stored enums and domain values locale-neutral; do not propose a database migration simply to translate labels. Use `?mode=web` for the unframed mobile browser and `?mode=review&device=iphone` / `?mode=review&device=pixel-10` to retain the simulator while reviewing on desktop.

For body check-in, show the step count and a discoverable scroll cue; keep the body-orientation caption outside the art with clear breathing room. Use one dominant next-step CTA and visually separate optional skip/sample actions. Confirm before clearing any existing regional entries. Fixed actions need a solid canvas, comfortable side insets, scroll clearance and a safe-area fill that does not paint over Android navigation chrome.

When UI is changed, review both iPhone and Pixel simulator presets, actual mobile web when applicable, and native behavior when affected. Check Vietnamese glyphs and font weights; check long English copy when English UI is in scope or already present. Also check larger text, focus and screen-reader labels, contrast, narrow/short/landscape viewports, safe areas, keyboard, scroll reachability, opaque/inset fixed actions, and error/loading/empty states. Do not alter protected runtime solely to match a screenshot. Use current brand masters for app icon and in-app mark.

For lessons, support portrait and landscape source ratios without cropping the instructor, and label audio/subtitle language separately from UI language. Do not infer the quality, rights or pedagogical order of a clip from its filename. Teacher drafts and AI-generated pose illustrations require their own review before learner display.

Apply [mcy-change-review](../mcy-change-review/SKILL.md) for scope, risk classification and evidence. A plan or mockup is not a published UI; report what was actually implemented and tested.
