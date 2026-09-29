# Một chút Yoga MVP

Interactive learner MVP for mobile web and native packaging, built from the selected visual direction.

## Core learner flow

Welcome → Daily Body Check-in → Short session choice → Today’s Practice → Practice → Honest reflection → Journey.

## Current scope

- Side-aware full-body check-in with saved preferences for the illustration style.
- A local session guide with illustrated movement cues and a user-controlled timer.
- Reflection and Journey states that preserve unchanged, worse, unsure, skipped, and missing feedback separately.
- Supabase staging integration for email auth, profile, consent evidence, and explicitly consented learner check-ins.
- Teacher access, AI inference, media publishing, commerce, and account/data-request processing remain gated until their server, content, and policy checks pass.

## Run locally

```bash
npm ci
npm run dev
```

See `design-qa.md` for browser verification notes.
