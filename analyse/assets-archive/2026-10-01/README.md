# Archived unreferenced public assets — 01/10/2026

These tracked PNGs were moved byte-for-byte out of `public/assets/` after a case-sensitive repository-wide filename search found no references from app source, tests, documentation or other public files. Vite copies `public/` into the web build and Capacitor copies the resulting public tree into the native app, so retaining unreferenced files there needlessly inflated both outputs.

No image was deleted. Move an asset back to `public/assets/` if a reviewed source begins using it again. Hashes below capture the preserved originals:

| File | Bytes | SHA-256 |
|---|---:|---|
| `body-map-comfort.png` | 616219 | `6C1E8E5DF63EEC91817CA3346ECF5B7297D0DBC62FE9BAF2BDB5CD622E19237C` |
| `body-map-feminine-upper.png` | 1078519 | `E381A16908FCE49072ED10F0B820328ECD09EAB867B84D84278A59240677B0C5` |
| `body-map-masculine-upper.png` | 1318683 | `F7477B33C745C8726026FB29F73FB30C1E29ACC81D8554F580B8BDC35234B030` |
| `body-map-masculine.png` | 1366674 | `3E78D9D85E724B25A944BE08945E10E35448FF9A52496E26BDC80755A4B0104D` |
| `body-map-neutral-new.png` | 1471767 | `A446EFA65EBCEAF54680B2F9A4964CD3C76952BD37E9A5C0BD70DDEF3CCAC49C` |
| `body-map-neutral-upper.png` | 1358782 | `ECCEC5ACA69CEABA811186ADD590AB5D7876BA3D7052FA3C4EB9A9032BA76AE9` |
| `body-map-neutral.png` | 552084 | `289FF4C4A7339357F1FF8CE2229B85C1B39D7456F5AB30BBE175F6D3353C0386` |
| `motion-chest-open.png` | 171020 | `8BD4A85E0140788446F3CAC31E1AA8BD4C5C8ADDB0E1CA34A14836F9A82CB9D8` |

At the first archive pass, device chrome and QA reference material were not moved. The three unreferenced public QA/sample files were moved out of `public/` on 01/10/2026; see `qa-preview-source/` below. Active learner photography and body-map PNG masters were later converted to responsive WebP assets; their original bytes are preserved in `active-png-originals/` below. The brand-review HTML points to the archived sample image for internal review only.

## Active learner asset masters archived after WebP conversion — 01/10/2026

Before retiring the PNGs from the shipped `public/` tree, every image was compared side by side on the app's warm-ivory surface against a WebP q=.97 render. The comparison is in `../../ux-audit-2026-10-01/run-12/`. The 1024px sources use Canvas WebP quality 0.97; 512px (600px for the landscape card image) sources use quality 0.95. The 5 originals total 7,017,256 bytes; the 10 responsive WebP derivatives total 1,086,646 bytes (−5,930,610 bytes, 84.5%). Originals were moved, not deleted.

| Preserved original PNG | Bytes | SHA-256 |
|---|---:|---|
| `welcome-portrait.png` | 1,871,333 | `1094C46163184805ED81E8E12F1D1F531BE781BE900C900C7C1E43B75C8BEC3B` |
| `body-map-feminine-full.png` | 1,405,198 | `F703410D4F7260B622B0A4F49D0D68E69D1953DAB234F891DC5E257A1AF06145` |
| `body-map-masculine-full.png` | 1,527,368 | `6B20D96FE999EE95D242F9168E9D02713812C666F053F9D901FA6BA89307F20B` |
| `body-map-neutral-full.png` | 1,426,752 | `01372DBA948AF87E629BBE9E1A0DDFFA4D3CB2ADAAFC7EED2A32D7C36E87C07C` |
| `today-neck-stretch.png` | 786,605 | `2BA785D2B9FC8C99C0F0482013B6EA36F5EADEB1E18E59850D1FD69CD62811FC` |

| Shipped WebP derivative | Dimensions | Quality | Bytes | SHA-256 |
|---|---:|---:|---:|---|
| `welcome-portrait-512.webp` | 512×768 | 0.95 | 53,060 | `0C89D95D41FC80A754FB019A271FFA3117C60316C2CC09EF33A17FA8CACCF1AF` |
| `welcome-portrait-1024.webp` | 1024×1536 | 0.97 | 210,456 | `C6AE8B8B5D8BA39DBB117B3864D6092F493E1DF85C853DDB96637CE2C2BED1A1` |
| `body-map-feminine-full-512.webp` | 512×768 | 0.95 | 51,330 | `F38E4E09CAC103D8C17715F25BB542C9AC15C55CB3FEB77539C06294D46B7AF0` |
| `body-map-feminine-full-1024.webp` | 1024×1536 | 0.97 | 174,416 | `E4A7E3917533079F52CDD731031F3A3FC5B776EEB7FAF553866ABF479978DE62` |
| `body-map-masculine-full-512.webp` | 512×768 | 0.95 | 56,400 | `FBDCAEFB9B7B3CEFD7AFB960D51EF78B5762FF8360883BD7B746B3412FC72614` |
| `body-map-masculine-full-1024.webp` | 1024×1536 | 0.97 | 201,084 | `F54AF039B83197847F157EE042162979EE3853B0F71C9C4B8F8B339A211958A0` |
| `body-map-neutral-full-512.webp` | 512×768 | 0.95 | 50,876 | `F164856AB73549B891A0E1F224C4DD8E71ECB27FBC8A9F48E72CB1F5D57DD894` |
| `body-map-neutral-full-1024.webp` | 1024×1536 | 0.97 | 168,836 | `529DC4AB170647B01BAC9C51A18EDDAFE4AE7D53035B60AF12DD7E23858A8927` |
| `today-neck-stretch-600.webp` | 600×360 | 0.95 | 27,498 | `BFBF4E4670672EC5D2DF4AACF9616907998A3F110F36E2D4EB26ECEFC922A7A0` |
| `today-neck-stretch-1200.webp` | 1200×720 | 0.97 | 92,690 | `83AF3F60F06FE862DC9CD980646756B5B194E62D9EBDF80EA4970A067997900A` |

## QA comparison and unreferenced sample assets removed from public — 01/10/2026

The app source had no consumers for the QA comparison page or the two PNG files; the reference welcome image was an obsolete visual target and the practice photo appeared only in the internal brand-review HTML. These were moved, not deleted, so none is copied into future web/native builds from `public/`.

| Archived file | Original bytes | SHA-256 |
|---|---:|---|
| `qa-compare.html` | 909 | `94ED1BF3A07BC997F8CB91A839104DD0CF3DDA2BABFE35B996D765C9537955A9` |
| `qa-reference-welcome.png` | 314,275 | `CD9F49F43CA4E71176CBF72B6F6314E16429783B25D097B13F929CA5F335E02A` |
| `practice-shoulder-stretch.png` | 1,024,650 | `449B3046EA6085CF0658ABD1B3AFFE5AE1806EEFE0B78EB897713B6F7F4BBC0F` |

The previously ignored QA copies in `dist/client/` were verified against byte-identical safety copies at `analyse/ux-audit-2026-10-01/run-12/qa-compare.html` and that folder's `native-stage/` directory. The standard build was then run with permission to clean generated output; current `dist/client/` was rebuilt without those QA copies. The separate clean candidate at `run-12/clean-production-candidate/` is retained as comparison evidence.
