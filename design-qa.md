# Design QA — Một chút Yoga MVP

## Comparison target

- Source visual truth: `../generated_images/exec-c9015967-22a5-449c-856f-999cd5fc0f80.png`
- Focused Welcome source crop: `public/assets/qa-reference-welcome.png` (326 × 731 px)
- Browser-rendered implementation evidence: `http://terminal.local:4173/qa-compare.html`, opened and captured in the Cloud Browser on 2026-09-20.
- Comparison state: Welcome screen, iPhone template, content-only assessment. The source concept intentionally has no device frame; template-owned device chrome was excluded from the fidelity judgement.
- Source density normalization: source crop is a generated storyboard panel at 326 × 731 px. The QA comparison surface places it in a 393 × 852 CSS-px comparison slot using cover scaling.
- Implementation viewport: mobile runtime’s iPhone app content target is 393 × 852 CSS px. The Cloud Browser rendered the surrounding phone stage at a reduced scale to fit its visible window; the implementation remained browser-rendered, and the comparison surface retained the same app state.

## Full-view comparison evidence

The QA surface shows the selected Welcome visual and the browser-rendered implementation side-by-side. Both retain the ivory base, deep green editorial type, muted terracotta CTA, calm sage apparel, right-anchored photo, roomy hierarchy, and handwritten note as the emotional accent.

## Focused region comparison

The Welcome header, benefit list, hero image placement, handwritten encouragement, and primary CTA were all readable in the same browser capture. A separate crop was unnecessary because the comparison surface keeps these important regions large enough to assess together.

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] The generated Welcome photograph uses a different pose and room from the concept board.
  - Evidence: the selected board shows a closer sitting pose; the app uses a purpose-built full-body editorial image with equivalent palette and subject framing.
  - Impact: minor illustration variance only; hierarchy and brand tone are preserved.
  - Follow-up: replace with a commissioned brand shoot when a production photography library exists.

## Required fidelity surfaces

- Fonts and typography: Georgia provides the editorial serif hierarchy of the source; the template’s Roboto supports legible labels, buttons, and small UI text. Weights, wrapping, and line height were checked in the Welcome comparison.
- Spacing and layout rhythm: the implementation uses the mobile safe-area header, consistent 20–25 px content insets, a full-height right image, and an anchored CTA that remains above the home indicator.
- Colors and visual tokens: ivory, deep evergreen, muted sage, terracotta, and low-contrast warm surfaces map to the selected direction. Primary-action contrast is maintained.
- Image quality and asset fidelity: all non-standard imagery is raster artwork or photography. Standard interface icons use Radix Icons; no custom SVG or HTML-drawn assets were used for the body maps or photography.
- Copy and app-specific text: the Vietnamese copy uses “Một chút Yoga” and clearly distinguishes teacher feedback from AI summaries.

## Primary interactions tested in Cloud Browser

- Welcome → Check-in
- Select a body area and energy level; selected controls report `aria-pressed="true"`
- Check-in → Today’s Practice, using the selected area in the recommendation
- Start Practice; pause / continue state changes
- Finish Practice → Post-practice Reflection; enter and save a reflection
- Progress shows the saved-reflection confirmation
- Open a teacher milestone → teacher workspace → enter a note → send confirmation
- Open an AI milestone and verify the distinct AI source and data basis

## Console check

No application console errors were observed. The browser console contained Chrome extension metadata errors from `chrome-extension://…`, outside the prototype.

## Implementation checklist

- [x] Preserve mobile runtime integrity
- [x] Use the selected visual direction and generated assets
- [x] Implement the core learner flow
- [x] Implement teacher and AI feedback distinctions
- [x] Implement plan explanation and teacher note preview
- [x] Verify primary interactions and build output

## Follow-up polish

- Replace generated imagery with a commissioned photo library when available.
- Test English typography and handwritten-card font pairs once the international brand name is finalized.

final result: passed
