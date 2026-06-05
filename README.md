<div align="center">

<img src="https://raw.githubusercontent.com/aashir-athar/fuelio/master/assets/images/icon.png" alt="Fuelio app icon" width="120" height="120" />

# ⛽ Fuelio

**A 100% offline, privacy-first vehicle & fuel tracker for iOS and Android — built with React Native and Expo.**

> Drive Smarter · Spend Less · Maintain Better

[![Stars](https://img.shields.io/github/stars/aashir-athar/fuelio?style=for-the-badge&logo=github&color=B6F24D)](https://github.com/aashir-athar/fuelio/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/aashir-athar/fuelio/master?style=for-the-badge)](https://github.com/aashir-athar/fuelio/commits/master)
[![Top language](https://img.shields.io/github/languages/top/aashir-athar/fuelio?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/aashir-athar/fuelio)
[![Repo size](https://img.shields.io/github/repo-size/aashir-athar/fuelio?style=for-the-badge)](https://github.com/aashir-athar/fuelio)

[![Expo SDK 54](https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![100% Offline](https://img.shields.io/badge/Offline-100%25-3DDC84?style=flat-square)](#-privacy-first)
[![No Ads · No Tracking](https://img.shields.io/badge/Ads_&_Tracking-None-FF4757?style=flat-square)](#-privacy-first)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-B6F24D?style=flat-square)](#-contributing)

[**Features**](#-features) · [**Tech Stack**](#-tech-stack) · [**Getting Started**](#-getting-started) · [**Usage**](#-usage) · [**Architecture**](#-architecture) · [**Contributing**](#-contributing)

</div>

---

**Fuelio** is an offline-first, privacy-first vehicle management app that lets you track fuel fills, calculate real fuel efficiency, and log service history entirely on your device. Built with **React Native**, **Expo**, and **TypeScript**, it runs natively on **iOS and Android** from a single codebase — with zero cloud, zero ads, and zero tracking. Every fill-up, oil change, and analytics chart is computed and stored locally, so your data never leaves your phone.

Unlike typical fuel logs that divide liters by distance, Fuelio uses a **full-tank-window algorithm** — the methodology used by professional fleet management software — so your mileage numbers stay accurate even when you log partial fills.

> 🚧 **Active development.** Fuelio is feature-rich and usable today; APIs and screens may still evolve. Stars and issues are welcome.

## ✨ Features

| | Feature | What it does |
|:---:|:---|:---|
| 🚗 | **Vehicle Management** | Add unlimited vehicles with make, model, year, tank capacity, and license plate. Set an **active vehicle** the whole app follows. Supports 5 fuel types: Petrol, Diesel, Hybrid, CNG, and EV. |
| ⛽ | **Fuel Tracking** | Log volume, price, odometer, full vs partial tank, and notes. Odometer auto-bumps on newer entries. Edit or delete any past fill. |
| 📐 | **Accurate Efficiency** | Real km/L (or mi/gal) via the **full-tank-window algorithm** — correct even across partial fills, where naive math breaks. |
| 🔧 | **Service History** | 9 service types with auto-calculated next-due mileage. Oil changes capture SAE grade, oil type, and quantity. Reminder cards surface on Home. |
| 📊 | **Analytics** | Average/best/worst efficiency, total distance, cost-per-km, an efficiency **line chart**, and a monthly-spend **bar chart**, filtered by week/month/year/all-time. |
| ⚙️ | **Units & Themes** | System / Light / Dark theme, km or mi, liters or gallons, and 7 currencies (USD, EUR, GBP, PKR, AED, SAR, INR). |
| 🔒 | **Privacy First** | 100% offline — no network requests, analytics SDKs, crash reporters, or ads. One-tap full data wipe in Settings. |
| 📤 | **CSV Export** | Export your records as RFC-4180 CSV and share them via the native share sheet. |

## 🛠️ Tech Stack

| Category | Technology | Version |
|:---|:---|:---|
| **Framework** | [Expo](https://expo.dev) | `~54.0.33` |
| **Runtime** | [React Native](https://reactnative.dev) (New Architecture) | `0.81.5` |
| **Language** | [TypeScript](https://www.typescriptlang.org) (`strict`) | `~5.9.2` |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (typed routes) | `~6.0.23` |
| **State** | [Zustand](https://zustand-demo.pmnd.rs) | `^5.0.12` |
| **Persistence** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | `2.2.0` |
| **Animations** | [Reanimated](https://docs.swmansion.com/react-native-reanimated/) + [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) | `~4.1.1` / `~2.28.0` |
| **Icons** | [@expo/vector-icons](https://icons.expo.fyi) (Ionicons) | `^15.0.3` |
| **Haptics** | [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) | `~15.0.8` |
| **Compiler** | React Compiler (experimental) | ✅ enabled |

## 🚀 Getting Started

### Prerequisites

- **Node.js** — a recent LTS release (Expo SDK 54)
- **npm** (ships with Node) — or your preferred package manager
- **Expo Go** app, or an Android emulator / iOS simulator
- Optional: the [Expo CLI](https://docs.expo.dev/more/expo-cli/) (`npx expo` works without a global install)

### Installation

```bash
git clone https://github.com/aashir-athar/fuelio.git
cd fuelio
npm install
```

### Run

```bash
# Start the Metro dev server (scan the QR code with Expo Go)
npm start
```

Then launch on a specific platform:

```bash
npm run android   # open on Android emulator / device
npm run ios       # open on iOS simulator / device
npm run web       # run in the browser
```

## 📖 Usage

Once the app is running, the flow is:

1. **Onboard** — on first launch, add your first vehicle (make, model, fuel type, tank capacity).
2. **Log a fill** — from Home or the Fuel tab, record volume, price, odometer, and whether the tank was filled to full. Mark fills as *full tank* for the most accurate efficiency.
3. **Track service** — add oil changes, tire rotations, brakes, and more; next-due mileage is calculated automatically and surfaced as a reminder.
4. **Review analytics** — open the Analytics tab to see efficiency trends and monthly spend, filtered by time range.
5. **Export** — from Settings, export everything to CSV and share via the native sheet.

<details>
<summary><strong>How the efficiency algorithm works</strong></summary>

Efficiency is computed only between consecutive **full-tank** entries (`src/utils/fuelAlgorithm.ts`):

```
For each full-tank fill:
  1. Walk backward to the previous full-tank fill (the "anchor")
  2. Sum all liters between the anchor and the current fill (partials included)
  3. Efficiency = (currentOdometer − anchorOdometer) / sumLiters
```

Each result is then scored relative to the vehicle's own historical average:

| Score | Label | Threshold |
|:---:|:---|:---|
| 🟢 | **Excellent** | > 8% above personal average |
| 🔵 | **Good** | 2–8% above personal average |
| 🟡 | **Average** | within ±5% of personal average |
| 🔴 | **Poor** | > 5% below personal average |

</details>

## 🏗 Architecture

Fuelio is structured around Expo Router file-based routes (`app/`) and a `src/` core of stores, hooks, theme tokens, and utilities.

- **Navigation guard** — `app/_layout.tsx` enforces onboarding vs. tabs routing on every navigation, while explicitly allowing modal segments through.
- **Hydration gate** — four persisted Zustand stores rehydrate from AsyncStorage before the first render, eliminating the onboarding flash for returning users.
- **Design system** — typed `space`, `radius`, `font`, and `spring` tokens power a primitives library (Button, Card, Sheet, SegmentedControl, charts) with full Light/Dark theming.
- **Single source of truth** — all domain types live in `src/types/index.ts`.

## 🗺️ Roadmap

- [x] Offline vehicle, fuel, and service tracking
- [x] Full-tank-window efficiency algorithm
- [x] Analytics with line + bar charts
- [x] CSV export and service reminders
- [ ] Receipt photo attachments in the UI
- [ ] Local backup & restore
- [ ] Localization (i18n) beyond units/currency
- [ ] Automated tests + CI

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-thing`)
3. Commit your changes (`git commit -m 'feat: add amazing thing'`)
4. Push to the branch (`git push origin feat/amazing-thing`)
5. Open a Pull Request

Please run `npm run lint` before submitting.

## 📄 License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.

## 👤 Author

**Aashir Athar**

[![GitHub](https://img.shields.io/badge/GitHub-aashir--athar-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/aashir-athar)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-aashirathar-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/aashirathar/)
[![X](https://img.shields.io/badge/X_(Twitter)-aashirathar-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/aashirathar)

---

<div align="center">

<sub>Built with React Native + Expo by <a href="https://github.com/aashir-athar">aashir-athar</a> · If Fuelio helped you, consider leaving a ⭐</sub>

<br/><br/>

<sub><b>Keywords:</b> react native fuel tracker · expo offline vehicle management app · privacy-first expense tracker · fuel economy / mileage calculator · car maintenance & service log · typescript ios android mobile app</sub>

</div>
