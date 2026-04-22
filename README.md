<div align="center">

<br/>

<!-- App Icon -->
<img src="assets/images/icon.png" width="100" height="100" style="border-radius: 24px" alt="Fuelio" />

<br/><br/>

# **FUELIO**

### Drive Smarter · Spend Less · Maintain Better

<br/>

> A **100% offline**, privacy-first vehicle management app built with React Native & Expo.  
> Track fuel fills, calculate real efficiency, log service history — all on-device. Zero cloud. Zero ads. Zero tracking.

<br/>

[![Expo](https://img.shields.io/badge/Expo-54.0.33-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![New Arch](https://img.shields.io/badge/New_Architecture-Enabled-B6F24D?style=for-the-badge)](https://reactnative.dev/docs/the-new-architecture/landing-page)

[![Offline](https://img.shields.io/badge/Offline-100%25-3DDC84?style=flat-square)](/)
[![No Ads](https://img.shields.io/badge/Ads-None-FF4757?style=flat-square)](/)
[![No Tracking](https://img.shields.io/badge/Tracking-None-FF4757?style=flat-square)](/)
[![License](https://img.shields.io/badge/License-MIT-8A94A8?style=flat-square)](/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-B6F24D?style=flat-square)](/)

<br/>

[**Features**](#-features) · [**Tech Stack**](#-tech-stack) · [**Getting Started**](#-getting-started) · [**Architecture**](#-architecture) · [**Contributing**](#-contributing)

</div>

---

<br/>

## ✨ Features

<br/>

<table>
<tr>
<td width="50%" valign="top">

### 🚗 &nbsp;Vehicle Management
Add unlimited vehicles with make, model, year, fuel type, tank capacity, and license plate. Edit or delete any vehicle — cascades to all linked records. Set an **active vehicle** and the entire app follows it. Supports **5 fuel types**: Petrol · Diesel · Hybrid · CNG · EV.

<br/>

### ⛽ &nbsp;Fuel Tracking
Log liters/gallons, price, odometer, full vs partial tank, and optional notes. Odometer auto-updates when a new entry is higher. Edit or delete any past fill. Efficiency is computed using the **full-tank-window algorithm** — the only statistically correct method.

<br/>

### 🔧 &nbsp;Service History
**9 service types** supported: Oil Change · Tire Rotation · Brakes · Battery · Air Filter · Timing Belt · Alignment · Coolant · Other. Oil-change entries capture SAE grade, oil type, and quantity. Next-due mileage is auto-calculated. Reminder cards surface on the home screen.

</td>
<td width="50%" valign="top">

### 📊 &nbsp;Analytics
Average, best, and worst efficiency per vehicle. Total distance, fuel, cost, and cost-per-km. **Line chart** for efficiency over time. **Bar chart** for monthly spend. Time filters: Week · Month · Year · All time. Efficiency scored as Excellent / Good / Average / Poor relative to your own baseline.

<br/>

### ⚙️ &nbsp;Settings
- **Theme** — System / Light / Dark
- **Distance** — km or mi
- **Volume** — Liters or Gallons
- **Currency** — USD · EUR · GBP · PKR · AED · SAR · INR
- **Notifications** — service reminder alerts

<br/>

### 🔒 &nbsp;Privacy First
**100% offline** — zero network requests, ever. No analytics SDK, no crash reporters, no ads. All data lives in `AsyncStorage` on-device. One-tap full data wipe in Settings.

</td>
</tr>
</table>

<br/>

---

<br/>

## ⚗️ The Fuel Algorithm

> `src/utils/fuelAlgorithm.ts`

**Why naive math breaks:** dividing liters by distance produces a wrong reading the moment a partial fill is logged. A 20L partial followed by a 40L full fill produces two incorrect efficiency numbers.

**The full-tank-window method** only computes efficiency between consecutive full-tank entries:

```
For each full-tank fill:
  1. Walk backward through entries until the previous full-tank fill (the "anchor")
  2. Sum all liters between anchor and current fill (partials included)
  3. Efficiency = (currentOdometer − anchorOdometer) / sumLiters
```

This matches the methodology used by professional fleet management software.

**Efficiency classification** — relative to the vehicle's own historical average:

| Score | Label | Threshold |
|:---:|:---|:---|
| 🟢 | **Excellent** | > 8% above personal average |
| 🔵 | **Good** | 2 – 8% above personal average |
| 🟡 | **Average** | within ±5% of personal average |
| 🔴 | **Poor** | > 5% below personal average |

<br/>

---

<br/>

## 🛠 Tech Stack

| Category | Library | Version |
|:---|:---|:---|
| **Framework** | [Expo](https://expo.dev) | `~54.0.33` |
| **UI** | [React Native](https://reactnative.dev) | `0.81.5` |
| **Language** | TypeScript | `~5.9.2` |
| **Router** | [Expo Router](https://expo.github.io/router) | `~6.0.23` |
| **Animations** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | `~4.1.1` |
| **Gestures** | [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) | `~2.28.0` |
| **State** | [Zustand](https://zustand-demo.pmnd.rs) | `^5.0.12` |
| **Persistence** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | `2.2.0` |
| **Icons** | [@expo/vector-icons](https://icons.expo.fyi) · Ionicons | `^15.0.3` |
| **Haptics** | expo-haptics | `~15.0.8` |
| **Architecture** | React Native New Architecture | ✅ enabled |
| **Compiler** | React Compiler (Babel) | ✅ experimental |

<br/>

---

<br/>

## 🎨 Design System

### Brand Colors

| Token | Dark | Light | Usage |
|:---|:---:|:---:|:---|
| `accent` | `#B6F24D` | `#8DC827` | CTAs, charts, active states |
| `background` | `#0D1117` | `#F4F6FB` | Screen backgrounds |
| `surface` | `#161B27` | `#FFFFFF` | Cards, sheets |
| `surfaceElevated` | `#1E2433` | `#EEF1F8` | Inputs, raised elements |
| `danger` | `#FF4757` | `#E33B4A` | Delete actions, errors |
| `textPrimary` | `#F0F4FF` | `#0D1117` | Body copy |
| `textSecondary` | `#8A94A8` | `#4A5168` | Labels, captions |
| `gold` | `#F5C842` | `#E0A81F` | Upcoming service warnings |
| `secondary` | `#4DAFFF` | `#2E8FE0` | Line charts, secondary highlights |

### Spacing — 8-point Grid

```
space[1] =  4px    space[4] = 16px    space[7] = 32px
space[2] =  8px    space[5] = 20px    space[8] = 40px
space[3] = 12px    space[6] = 24px    space[10]= 64px
```

### Motion Presets

```ts
spring.snappy  // damping: 18, stiffness: 320  →  button press feedback
spring.smooth  // damping: 22, stiffness: 220  →  layout transitions
spring.soft    // damping: 14, stiffness: 120  →  playful entrances
```

### Text Variants

`micro` · `caption` · `label` · `body` · `bodyLg` · `heading` · `title` · `display`

Tone props: `primary` · `secondary` · `muted` · `accent` · `onAccent` · `danger`

<br/>

---

<br/>

## 📁 Project Structure

```
fuelio/
│
├── app/                              # Expo Router — file-based routes
│   ├── _layout.tsx                   # Root layout: providers · nav guard · hydration gate
│   ├── index.tsx                     # Entry redirect
│   │
│   ├── (onboarding)/
│   │   ├── welcome.tsx               # First-launch screen
│   │   └── add-first-vehicle.tsx     # Onboarding vehicle form
│   │
│   ├── (tabs)/
│   │   ├── index.tsx                 # 🏠 Home — stats, recent entries, reminders
│   │   ├── fuel.tsx                  # ⛽ Fuel history list
│   │   ├── service.tsx               # 🔧 Service history & reminders
│   │   ├── analytics.tsx             # 📊 Charts & stats
│   │   └── garage.tsx                # 🚗 All vehicles
│   │
│   └── modal/
│       ├── settings.tsx              # ⚙️  App settings
│       ├── export.tsx                # 📤 CSV export
│       ├── add-vehicle.tsx           # Add new vehicle
│       ├── edit-vehicle.tsx          # Edit · delete vehicle
│       └── edit-fuel.tsx             # Edit · delete fuel entry
│
└── src/
    ├── components/
    │   ├── primitives/               # Base design system components
    │   │   ├── Button.tsx            # primary · secondary · danger · ghost
    │   │   ├── Card.tsx
    │   │   ├── Chip.tsx              # Selection pill toggle
    │   │   ├── GlassPanel.tsx
    │   │   ├── Input.tsx             # Label · suffix · error · focus ring
    │   │   ├── SegmentedControl.tsx  # Animated pill indicator (pixel-accurate)
    │   │   ├── Sheet.tsx             # Drag-to-dismiss bottom sheet + KAV
    │   │   └── StatTile.tsx
    │   │
    │   ├── cards/
    │   │   ├── FuelEntryRow.tsx
    │   │   ├── ServiceReminderCard.tsx
    │   │   └── VehicleCard.tsx
    │   │
    │   ├── charts/
    │   │   ├── BarChart.tsx          # Monthly spend
    │   │   └── LineChart.tsx         # Efficiency over time
    │   │
    │   └── sheets/                   # Bottom sheet content panels
    │       ├── AddFuelSheet.tsx
    │       ├── AddServiceSheet.tsx
    │       └── VehicleForm.tsx
    │
    ├── store/
    │   ├── vehicle.store.ts          # Persisted vehicle state
    │   ├── fuel.store.ts             # Persisted fuel entries
    │   ├── service.store.ts          # Persisted service entries
    │   ├── settings.store.ts         # Theme · units · currency · active vehicle
    │   ├── hydration.ts              # Multi-store hydration gate
    │   └── storage.ts                # AsyncStorage ↔ Zustand adapter
    │
    ├── hooks/
    │   ├── useActiveVehicle.ts       # Resolves active vehicle from store
    │   ├── useVehicleStats.ts        # Memoised per-vehicle aggregate stats
    │   ├── useHaptics.ts             # Haptic feedback wrapper
    │   └── useReduceMotion.ts        # Respects system reduce-motion setting
    │
    ├── theme/
    │   ├── ThemeProvider.tsx         # Context — wraps app in active color theme
    │   ├── colors.ts                 # darkColors · lightColors token objects
    │   └── tokens.ts                 # space · radius · font · shadow · spring · duration
    │
    ├── types/
    │   └── index.ts                  # All domain types — single source of truth
    │
    └── utils/
        ├── fuelAlgorithm.ts          # Full-tank-window efficiency algorithm
        ├── format.ts                 # Number · currency · distance · date formatters
        ├── csv.ts                    # RFC-4180 CSV serialisers
        └── id.ts                     # Prefixed ID generator
```

<br/>

---

<br/>

## 🏗 Architecture

### Navigation Guard

`app/_layout.tsx` runs a `useEffect` on every route change enforcing three rules:

```
not onboarded           →  /(onboarding)/welcome
onboarded, 0 vehicles   →  /(onboarding)/add-first-vehicle
onboarded, has vehicles →  /(tabs)
```

Modal segments are explicitly allowed through — without this, opening any modal would immediately redirect back to tabs.

### Hydration Gate

All four Zustand stores persist to AsyncStorage. On cold start there is a window where every store is at its empty initial state. `useStoreHydration()` blocks the root render until all stores confirm `hasHydrated()` — eliminating the onboarding flash that would otherwise hit returning users.

```ts
const hydrated = useStoreHydration();
if (!hydrated) return null; // hold render until AsyncStorage is ready
```

### Sheet + KeyboardAvoidingView

`KeyboardAvoidingView` sits **inside** the Sheet's `Animated.View`, wrapping only the children. The scrim, drag handle, background, and rounded corners all live outside — so KAV never affects the sheet's visual structure.

### SegmentedControl — Pixel-accurate Indicator

The animated pill uses `onLayout` to measure the container's real pixel width, then translates by:

```
translateX = index × (containerWidth − padding×2) / optionCount
```

This avoids the percentage-of-percentage bug that causes the indicator to drift right on all but the first option.

<br/>

---

<br/>

## 🗄 Data Model

<details>
<summary><strong>Vehicle</strong></summary>

```ts
interface Vehicle {
  id: string;            // "veh_k2x9m"
  nickname: string;
  make: string;
  model: string;
  year: number;
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'cng' | 'ev';
  tankCapacity: number;  // liters
  odometer: number;      // auto-bumped on fuel entry
  licensePlate?: string;
  vin?: string;
  photoUri?: string;
  color?: string;
  createdAt: number;     // Unix ms
}
```

</details>

<details>
<summary><strong>FuelEntry</strong></summary>

```ts
interface FuelEntry {
  id: string;             // "fuel_p8zq1"
  vehicleId: string;
  date: number;           // Unix ms
  liters: number;
  pricePerLiter: number;
  odometer: number;
  fullTank: boolean;
  totalCost: number;      // stored: liters × pricePerLiter
  distanceDriven?: number;// computed
  efficiency?: number;    // km/L, computed
  notes?: string;
  receiptUri?: string;
}
```

</details>

<details>
<summary><strong>ServiceEntry</strong></summary>

```ts
interface ServiceEntry {
  id: string;              // "svc_r3nq7"
  vehicleId: string;
  type: ServiceType;
  date: number;
  odometer: number;
  cost: number;
  completed: boolean;
  oilGrade?: OilGrade;     // oil-change only (9 SAE grades)
  oilType?: OilType;       // 'fully-synthetic' | 'semi-synthetic' | 'mineral'
  oilQuantity?: number;    // liters
  nextDueMileage?: number; // auto: odometer + service interval
  nextDueDate?: number;
  notes?: string;
  photoUri?: string;
}
```

</details>

### Service Intervals

| Service | Interval |
|:---|---:|
| Oil Change | 5,000 km |
| Tire Rotation | 10,000 km |
| Air Filter | 20,000 km |
| Alignment | 20,000 km |
| Brakes | 40,000 km |
| Coolant | 40,000 km |
| Battery | 60,000 km |
| Timing Belt | 100,000 km |

<br/>

---

<br/>

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Expo Go** on your phone, or a simulator

### Install & Run

```bash
# Clone
git clone https://github.com/yourname/fuelio.git
cd fuelio

# Install dependencies
npm install

# Start the dev server
npm start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

> **Tip:** A development build gives you accurate haptics, gestures, and Reanimated behaviour — Expo Go has limitations with the New Architecture.

### Development Build

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile development
```

<br/>

---

<br/>

## 📦 Building an APK with EAS

EAS Build runs on Expo's cloud — no Android Studio, no JDK, no local keystore needed.

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Log in (free account at expo.dev)
eas login

# 3. Link project
eas init

# 4. Sideloadable APK — no Play Store needed
eas build --platform android --profile preview

# 5. Play Store bundle
eas build --platform android --profile production
```

In `app.json`, set your package name before first build — it cannot be changed after publishing:

```json
{
  "expo": {
    "android": {
      "package": "com.yourname.fuelio"
    }
  }
}
```

Build time is roughly **10–15 minutes**. EAS prints a download URL and QR code when done.

<br/>

---

<br/>

## 🧰 Utilities

### `format.ts`

| Function | Returns |
|:---|:---|
| `formatNumber(n, decimals)` | Locale-aware string, `—` for non-finite |
| `formatCurrency(amount, currency)` | `$ 42` · `Rs 1,200` · `₹ 850` |
| `formatDistance(km, unit)` | `320 km` or `198 mi` |
| `formatVolume(liters, unit)` | `45.00 L` or `11.89 gal` |
| `formatEfficiency(kmPerLiter, unit)` | `14.2 km/L` or `33.4 mpg` |
| `formatDate(timestamp, style)` | `Apr 18` or `Fri, Apr 18, 2026` |
| `formatRelativeDate(timestamp)` | `Today` · `Yesterday` · `3d ago` · `2w ago` |

### `csv.ts`

RFC-4180 serialisers for all three data types. Commas, quotes, and newlines in values are properly escaped. Used by the Export modal to copy data to clipboard.

### `id.ts`

`createId(prefix)` generates prefixed unique IDs — `veh_k2x9m`, `fuel_p8zq1`, `svc_r3nq7`. Used by every store's `add` action.

<br/>

---

<br/>

## 💡 Ideas for Contributors

Fuelio is open to contributions! Here are features that would make it even better — feel free to pick one up and open a PR:

| Idea | Difficulty | Notes |
|:---|:---:|:---|
| 🌍 **Trip tracking** — log individual trips with start/end odometer | Medium | New `TripEntry` type, new tab |
| 📸 **Receipt photo** — attach a photo to any fuel entry | Easy | `expo-image-picker` already installed |
| 🔔 **Distance-based reminders** — push notifications when service is due | Medium | `expo-notifications` already installed |
| 📤 **PDF export** — export service history as a formatted PDF | Medium | `expo-sharing` already available |
| 🗺️ **Station map** — find nearby fuel stations | Hard | Would need location permission |
| 📱 **iOS support** — test & polish the iOS experience | Medium | Currently Android-first |
| 🌐 **More currencies** — add more currency options | Easy | `src/store/settings.store.ts` |
| 🚘 **Multi-driver** — track who drove per fill | Medium | Add `driverId` field to entries |
| 🎨 **Accent color picker** — let users pick their accent color | Easy | Extend `ThemeProvider` |
| 🔄 **iCloud/Google Drive backup** — optional cloud backup of data | Hard | New privacy design needed |
| 🌙 **AMOLED black theme** — pure black `#000000` background option | Easy | Add to `colors.ts` |
| 📊 **CO₂ tracker** — display estimated emissions per vehicle | Easy | `estimatedCO2kg` already computed |

**How to contribute:**

1. **Fork** the repository
2. **Branch** off `main` — `git checkout -b feature/my-feature`
3. **Follow conventions:**
   - All colors via `useTheme()` — no hardcoded hex values in components
   - All spacing via `space[n]` tokens — no hardcoded pixel values
   - New domain types go in `src/types/index.ts`
   - TypeScript strict mode is on — no `any`
4. **Test** on Android (and iOS if you can)
5. **Open a PR** with a clear description of what changed and why

No contribution is too small — bug fixes, documentation improvements, and new translations are just as welcome as new features.

<br/>

---

<br/>

<div align="center">

**Built by [Aashir Athar](https://instagram.com/aashirathar)**

Made with ☕ · 100% Offline · No Ads · No Tracking

<br/>

*If Fuelio saves you money on fuel, give it a ⭐*

</div>
