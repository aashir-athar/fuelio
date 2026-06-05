# Fuelio — Zero to Deploy

A step-by-step guide to take Fuelio v2.0 from a clean clone to a sideloadable APK and a Play Store release.

Fuelio uses native modules (Lottie, background location, notifications) and the New Architecture, so **Expo Go cannot run it fully**. You build a **development build** instead. Everything below is Android-first, since that is what Fuelio is developed and tested against.

---

## 0. Prerequisites

| Tool | Version | Check |
|:---|:---|:---|
| **Node.js** | 18 or newer | `node -v` |
| **npm** | bundled with Node | `npm -v` |
| **EAS CLI** | latest | `npm install -g eas-cli` then `eas --version` |
| **Expo account** | free | sign up at [expo.dev](https://expo.dev), then `eas login` |
| **Android device** | any modern Android | USB debugging or a way to sideload an APK |

You do **not** need Android Studio, a JDK, or a local keystore for the cloud build paths. You only need the Android toolchain if you want to use the local `npx expo run:android` path in Step 3.

Project facts that are already wired up for you:

- `app.json` → `version: "2.0.0"`, package `com.iamaashirathar.fuelio`, owner `iamaashirathar`, EAS `projectId` set.
- `app.json` → `expo-notifications` and `expo-location` plugins are configured with the right permission strings.
- `eas.json` → `appVersionSource: "remote"` (EAS owns version/build numbers); `development`, `preview`, and `production` profiles exist.

---

## 1. Install

```bash
git clone https://github.com/aashir-athar/fuelio.git
cd fuelio
npm install
```

`npm install` is the source of truth for dependencies. Do not hand-edit `package.json`; if you need to add a package, use `npx expo install <pkg>` so the version matches the SDK.

---

## 2. Run the quality gates

Run all four before you build. They are fast and catch most problems before a 10-minute cloud build does.

```bash
npm run typecheck     # tsc --noEmit — strict TypeScript, no any
npm run lint          # expo lint
npm test              # node --test — the 13-case fuel-algorithm harness
npx expo-doctor       # dependency + native config health check
```

What "green" looks like:

- **typecheck** prints nothing and exits 0.
- **lint** reports no errors.
- **test** reports `tests 13` / `pass 13` / `fail 0`.
- **expo-doctor** reports all checks passed.

---

## 3. Run a development build

A dev build is a real app binary with the dev client embedded, so you get accurate native behavior (Lottie splash, haptics, location, notifications) plus fast refresh. Pick one path.

### Option A — Cloud dev build (recommended, no local Android toolchain)

```bash
eas login
eas build --profile development
```

EAS builds an `internal`-distribution dev client in the cloud (~10–15 min) and gives you a download URL and QR code. Install it on your device, then start the bundler:

```bash
npm start
```

Open the installed Fuelio dev client and it connects to your bundler.

### Option B — Local build (requires Android SDK / Java)

```bash
npx expo run:android
```

This compiles and installs directly onto a connected device or running emulator. Use this only if you already have a working Android native toolchain.

> Why not Expo Go? Fuelio's native modules and New Architecture are not supported there. Use a dev build.

---

## 4. Build a sideloadable APK (preview)

The `preview` profile produces a single installable **APK** with internal distribution — perfect for sharing with testers or putting on your own phone without the Play Store.

```bash
eas build -p android --profile preview
```

When it finishes, EAS prints a build page with a **download URL** and a **QR code**.

### Install the APK on a device

Choose whichever is easiest:

- **QR code** — scan the QR EAS prints; download and open the APK on the phone. Approve "install from unknown sources" if prompted.
- **Direct link** — open the build's download URL in the phone's browser, then open the downloaded `.apk`.
- **ADB** — with the phone connected over USB:

  ```bash
  adb install path/to/fuelio.apk
  ```

After install, launch Fuelio and smoke-test the native paths: the animated splash, adding a vehicle and a fuel fill, a service reminder, and (optionally) enabling station detection in Settings to confirm the location permission flow.

---

## 5. Production build and Play Store submission

The `production` profile builds a **Play Store AAB** and auto-increments the build number (because `appVersionSource` is `remote`, EAS manages this for you; the app version stays `2.0.0` from `app.json`).

```bash
# 1. Build the release AAB
eas build -p android --profile production

# 2. Submit the latest build to Google Play
eas submit -p android --latest
```

First-time submission notes:

- You need a **Google Play Developer account** and an app entry created in the Play Console.
- `eas submit` will ask for (or read from `eas.json`) a Google service-account key for automated uploads. Follow the prompts the first time; EAS can store it for later runs.
- The release lands in the track you choose (internal, closed, or production) for you to review and roll out from the Play Console.

To bump the user-facing version for a future release, change `version` in `app.json` (for example to `2.1.0`) and rebuild. The internal build number is handled automatically by EAS.

---

## 6. Pre-release checklist

| ✅ | Item |
|:---:|:---|
| ☐ | `npm run typecheck` clean |
| ☐ | `npm run lint` clean |
| ☐ | `npm test` — 13/13 passing |
| ☐ | `npx expo-doctor` clean |
| ☐ | Animated splash plays and hands off without a flash |
| ☐ | Add vehicle → add fuel fill → economy shows correctly |
| ☐ | Service reminder schedules a notification (fires with app closed) |
| ☐ | Station detection opt-in flow requests location correctly (and stays off by default) |
| ☐ | Units toggle (km↔mi, L↔gal) re-renders history without corrupting data |
| ☐ | `app.json` version is correct for this release |
| ☐ | Preview APK installs and launches on a real device |

---

## Troubleshooting

| Symptom | Fix |
|:---|:---|
| `eas` command not found | `npm install -g eas-cli`, then reopen the terminal |
| Build fails on a dependency version | run `npx expo install --check` to align versions to SDK 56 |
| Notifications never fire | confirm permission was granted, and that you are on a **dev/preview/production build**, not Expo Go |
| Station detection does nothing | it is **off by default** — enable it in Settings; it also needs background-location permission |
| App redirects to onboarding on every launch | data may be cleared; this is the hydration/nav guard working as intended after a wipe |
| `npx expo run:android` fails | you are missing the Android toolchain — use the cloud `eas build --profile development` path instead |

---

Built by [Aashir Athar](https://github.com/aashir-athar) · [github.com/aashir-athar/fuelio](https://github.com/aashir-athar/fuelio)
