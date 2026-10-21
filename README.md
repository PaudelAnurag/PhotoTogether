# PhotoTogether — Phase 1

Expo SDK 58 · React Native 0.88 · TypeScript · Expo Router (`src/app`).

## Run

```bash
npm install
npx expo start            # Expo Go: everything except the automatic face check
npx expo run:android      # development build (adds ML Kit face check)
npx expo run:ios          # macOS only
npm run typecheck         # tsc --noEmit
npm test                  # crop-math self-check
```

## Implemented

- **Onboarding** (3 slides, skippable, remembered) → **Home** with three feature cards. No account anywhere.
- **Casual Photos**: front/back switch, flash cycle, capture, keep/retake, multi-photo session strip, save to library, share.
- **Official Photos**: country search → document type → structured requirements (`src/data/documentRequirements.ts`) → full-screen camera with head-and-shoulders guide → capture → crop screen (drag/resize a frame locked to the document aspect; Retake / Use Photo) → exact-size output → save / share / PDF / print / email.
- **Together Booth** (local, one phone): choose 2–8 photos, A shoots, hand over, B shoots, reveal, paired album; save image, save photos, PDF, print, email. Photo counts are enforced in `features/together/store.ts`; photo URIs are not exposed by the store until `reveal()` succeeds, and `reveal()` refuses unless both have `count` photos.
- **Official-photo storage**: `OfficialPhotoStorage` interface (`services/tempStorage.ts`), cache-only implementation. Nothing is uploaded or put in a database. Files are deleted when leaving the result screen; leaving is blocked while an export/print is running.

## Official requirements — what was verified (2026-10-19, read from the issuing authority)

| Country | Documents | Source |
|---|---|---|
| United States | Passport 51×51 mm, head 25–35 mm | travel.state.gov |
| Canada | Passport 50×70 mm, face 31–36 mm; online renewal 45–50 % head, ≥1200×1800 | canada.ca |
| Australia | Passport 35×45 mm (no face-height figure in the source) | passports.gov.au camera-operator guidelines |
| United Kingdom | Online passport ≥600×750 px (no head-size, aspect or print-rule figures on the page read) | gov.uk |

Each document lists what its source does not settle (`checkWithAuthority`) and the UI shows it. Visa and national-ID entries were not added because no official source was verified for them. Add a country by appending to `COUNTRIES`.

## Face detection — honest status

- `expo-camera` has no face detection and `expo-face-detector` is a removed legacy package, so there is **no live detection**. The live outline is a manual guide.
- After capture, `@react-native-ml-kit/face-detection` checks the still: face found, one face, inside/centered in the frame, and only flags size when clearly off (ML Kit's box is smaller than chin-to-crown). It does **not** measure eye position or exact head height and never claims compliance.
- That package is a legacy `NativeModules` module (last release 2025-09). **Not verified to link on RN 0.88 (new architecture).** If it fails, the app shows "unavailable" and the manual guide still works.
- Live guidance ("move closer") would need `react-native-vision-camera` v5 + `react-native-vision-camera-face-detector` (dev build, replaces `expo-camera` in the official flow). Not done.

## Status

| | |
|---|---|
| Works in Expo Go on a device (expected, untested on hardware) | onboarding, home, casual camera, official camera/crop/export, local Together Booth, PDF, print, share, email composer. Android Expo Go has limited media-library access — saving to the library may need a development build. |
| Needs a development build | automatic face check (ML Kit), reliable photo-library saving on Android |
| Needs a backend | remote Together Booth: invitations, per-participant private storage, server-side reveal validation. **None of it exists**; the UI says so. |
| Incomplete / unverified | no on-device testing was possible in this environment; `expo lint` and `expo-doctor` network checks could not run (sandbox proxy); crop output size is exact but file-size limits (e.g. Canada 200 KB–5 MB) are not checked; no multi-photo print sheet; front-camera mirroring set explicitly off (`mirror={false}`), not confirmed on hardware; official-photo background removal not implemented. |

## Verified in this environment

`tsc --noEmit` clean · `npm test` passes (crop aspect equals output aspect for every document, crop stays inside the image) · `expo export --platform android` bundles · `expo-doctor` 18/20 (the 2 failures are network lookups).
