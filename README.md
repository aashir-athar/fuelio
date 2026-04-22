<div align="center">

<img src="assets/images/icon.png" width="120" height="120" style="border-radius: 28px" alt="Fuelio icon" />

<h1>Fuelio</h1>

<p><strong>Drive smarter. Spend less. Maintain better.</strong></p>

<p>
  A fully offline, privacy-first vehicle management app.<br/>
  Track fuel, calculate real efficiency, log service history — all on-device.
</p>

<p>
  <img src="https://img.shields.io/badge/Expo-54.0.33-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/New_Architecture-enabled-B6F24D?style=flat-square" alt="New Arch" />
  <img src="https://img.shields.io/badge/Offline-100%25-success?style=flat-square" alt="Offline" />
  <img src="https://img.shields.io/badge/Ads-None-FF4757?style=flat-square" alt="No Ads" />
</p>

<p>
  <a href="#-features">Features</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-building-an-apk-with-eas">Build APK</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-data-model">Data Model</a>
</p>

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🚗 Vehicle Management
- Add unlimited vehicles with make, model, year, fuel type, tank capacity, and license plate
- Edit or delete any vehicle — cascades to all fuel & service records
- Set an **active vehicle** — logging and analytics follow it everywhere
- Supports **5 fuel types**: Petrol · Diesel · Hybrid · CNG · EV

### ⛽ Fuel Tracking
- Log liters/gallons, price, odometer, full/partial tank, and notes
- Odometer auto-updates when a new entry is higher
- Edit or delete any past entry
- Accurate efficiency via the **full-tank-window algorithm**

### 🔧 Service History
- **9 service types**: Oil Change · Tire Rotation · Brakes · Battery · Air Filter · Timing Belt · Alignment · Coolant · Other
- Oil change entries capture SAE grade, oil type, and quantity
- Auto-calculates next-due mileage per service type
- Reminder cards surface on the home screen

</td>
<td width="50%">

### 📊 Analytics
- Average, best, and worst efficiency per vehicle
- Total distance, fuel, cost, and cost-per-km
- **Line chart** — efficiency over time
- **Bar chart** — monthly spend
- Time filter: Week · Month · Year · All time
- Efficiency score: Excellent / Good / Average / Poor

### ⚙️ Settings
- Theme: System / Light / Dark
- Distance: km or mi
- Volume: Liters or Gallons
- Currency: USD · EUR · GBP · PKR · AED · SAR · INR
- Service reminder notifications

### 🔒 Privacy First
- **100% offline** — zero network requests
- No analytics, no crash reporters, no ads
- All data in AsyncStorage on-device
- One-tap full data wipe

</td>
</tr>
</table>

---

## 🛠 Tech Stack

| Category | Library | Version |
|:---|:---|:---|
| Framework | [Expo](https://expo.dev) | `~54.0.33` |
| UI | [React Native](https://reactnative.dev) | `0.81.5` |
| Language | TypeScript | `~5.9.2` |
| Router | [Expo Router](https://expo.github.io/router) | `~6.0.23` |
| Animations | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | `~4.1.1` |
| Gestures | [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) | `~2.28.0` |
| State | [Zustand](https://zustand-demo.pmnd.rs) | `^5.0.12` |
| Persistence | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | `2.2.0` |
| Icons | [@expo/vector-icons](https://icons.expo.fyi) · Ionicons | `^15.0.3` |
| Haptics | expo-haptics | `~15.0.8` |
| Clipboard | expo-clipboard | `~8.0.8` |
| Architecture | React Native New Architecture | ✅ enabled |
| Compiler | React Compiler (Babel) | ✅ experimental |

---

## 📁 Project Structure

```
fuelio/
│
├── app/                              # Expo Router — file-based routes
│   ├── _layout.tsx                   # Root layout: providers · nav guard · hydration gate
│   ├── index.tsx                     # Entry redirect
│   │
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx               # First-launch screen
│   │   └── add-first-vehicle.tsx     # Onboarding vehicle form
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Tab bar config
│   │   ├── index.tsx                 # 🏠 Home — stats, recent entries, reminders
│   │   ├── fuel.tsx                  # ⛽ Fuel history list
│   │   ├── service.tsx               # 🔧 Service history & reminders
│   │   ├── analytics.tsx             # 📊 Charts & stats
│   │   └── garage.tsx                # 🚗 All vehicles
│   │
│   └── modal/
│       ├── _layout.tsx               # Modal stack
│       ├── settings.tsx              # ⚙️  App settings
│       ├── export.tsx                # 📤 CSV export
│       ├── add-vehicle.tsx           # Add new vehicle
│       ├── edit-vehicle.tsx          # Edit · delete vehicle
│       └── edit-fuel.tsx             # Edit · delete fuel entry
│
└── src/
    ├── components/
    │   ├── primitives/               # Base design system components
    │   │   ├── Avatar.tsx
    │   │   ├── Button.tsx            # primary · secondary · danger · ghost
    │   │   ├── Card.tsx
    │   │   ├── Chip.tsx              # Selection pill toggle
    │   │   ├── EmptyState.tsx
    │   │   ├── GlassPanel.tsx
    │   │   ├── Input.tsx             # Label · suffix · error · focus ring
    │   │   ├── SectionHeader.tsx
    │   │   ├── SegmentedControl.tsx  # Animated pill indicator (pixel-accurate)
    │   │   ├── Sheet.tsx             # Drag-to-dismiss bottom sheet + KAV
    │   │   ├── StatTile.tsx
    │   │   └── Text.tsx              # Typed variants · tone props
    │   │
    │   ├── cards/
    │   │   ├── FuelEntryRow.tsx
    │   │   ├── ServiceReminderCard.tsx
    │   │   └── VehicleCard.tsx       # Pencil button → edit-vehicle modal
    │   │
    │   ├── charts/
    │   │   ├── BarChart.tsx          # Monthly spend
    │   │   └── LineChart.tsx         # Efficiency over time
    │   │
    │   └── sheets/                   # Bottom sheet content panels
    │       ├── AddFuelSheet.tsx
    │       ├── AddServiceSheet.tsx
    │       └── VehicleForm.tsx       # Shared add/edit form · footerSlot prop
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

---

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

> **Tip:** A development build gives you accurate haptics, gestures, and Reanimated behaviour — Expo Go has limitations with the new architecture.

### Development Build

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile development
```

Install the resulting APK once, then use `npm start` for fast refresh like Expo Go.

---

## 📦 Building an APK with EAS

EAS Build runs on Expo's cloud — no Android Studio, no JDK, no local keystore needed.

### 1 · Install EAS CLI

```bash
npm install -g eas-cli
```

### 2 · Log In

```bash
eas login
```

No account? Create one free at [expo.dev](https://expo.dev).

### 3 · Add your Android package name

In `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.yourname.fuelio"
    }
  }
}
```

> ⚠️ This cannot be changed after publishing to the Play Store. Choose carefully.

### 4 · Link to Expo

```bash
eas init
```

Writes a `projectId` into `app.json`. Creates the project on expo.dev if it doesn't exist.

### 5 · Generate `eas.json`

```bash
eas build:configure
```

Your `eas.json` will look like this:

```json
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

### 6 · Build

```bash
# Sideloadable APK — direct install, no Play Store needed
eas build --platform android --profile preview

# Play Store bundle
eas build --platform android --profile production
```

On first build, EAS generates and securely stores your keystore — just accept the prompt.  
Build time: **~10–15 minutes.** When done, EAS prints a download URL and a QR code.

### 7 · Install on Device

1. On Android go to **Settings → Install unknown apps** and allow your browser
2. Open the EAS download link or scan the QR code
3. Install and launch 🎉

---

## 🏗 Architecture

### Navigation Guard

`app/_layout.tsx` runs a `useEffect` on every route change that enforces three rules:

```
not onboarded           →  /(onboarding)/welcome
onboarded, 0 vehicles   →  /(onboarding)/add-first-vehicle
onboarded, has vehicles →  /(tabs)
```

The guard explicitly **allows `modal` segments through** — without this, opening any modal would immediately redirect back to tabs.

### Hydration Gate

All four Zustand stores persist to AsyncStorage. On cold start there is a window where every store is at its empty initial state. `useStoreHydration()` blocks the root render until all four stores confirm `hasHydrated()` — eliminating the onboarding flash that would otherwise hit returning users.

```ts
const hydrated = useStoreHydration();
if (!hydrated) return null; // hold render until AsyncStorage is ready
```

### Sheet + KeyboardAvoidingView

`KeyboardAvoidingView` sits **inside** the `Sheet`'s `Animated.View`, wrapping only the children. The scrim, drag handle, background, and rounded corners all live outside it — so KAV never affects the sheet's visual structure. Full-screen modals use KAV as their root with `behavior="padding"` on iOS only; Android handles it via `windowSoftInputMode`.

### SegmentedControl — Pixel-accurate Indicator

The animated pill uses `onLayout` to measure the container's real pixel width, then translates by:

```
translateX = index × (containerWidth − padding×2) / optionCount
```

This avoids the percentage-of-percentage bug that causes the indicator to drift right on all but the first option.

---

## ⚗️ The Fuel Algorithm

> `src/utils/fuelAlgorithm.ts`

**The problem with naive math:** `liters ÷ distance` breaks the moment a partial fill is logged. A 20L partial followed by a 40L full fill produces two wrong readings.

**The full-tank-window method** only computes efficiency between consecutive full-tank entries:

```
For each full-tank fill:
  1. Walk backward through entries until the previous full-tank fill (the "anchor")
  2. Sum all liters between anchor and current fill (partials included)
  3. Efficiency = (currentOdometer − anchorOdometer) / sumLiters
```

This matches the methodology used by professional fleet management software.

**Efficiency classification** — relative to the vehicle's own historical average:

| | Label | Threshold |
|:---:|:---|:---|
| 🟢 | Excellent | > 8% above average |
| 🔵 | Good | 2 – 8% above average |
| 🟡 | Average | within ±5% |
| 🔴 | Poor | > 5% below average |

---

## 🎨 Design System

### Brand Colors

| Token | Dark | Light | Usage |
|:---|:---:|:---:|:---|
| `accent` | `#B6F24D` | `#8DC827` | Active states, charts, CTAs |
| `background` | `#0D1117` | `#F4F6FB` | Screen backgrounds |
| `surface` | `#161B27` | `#FFFFFF` | Cards, sheets |
| `surfaceElevated` | `#1E2433` | `#EEF1F8` | Inputs, raised elements |
| `danger` | `#FF4757` | `#E33B4A` | Delete actions, errors |
| `textPrimary` | `#F0F4FF` | `#0D1117` | Body copy |
| `textSecondary` | `#8A94A8` | `#4A5168` | Labels, captions |

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

---

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
  completed: boolean;      // always true for logged entries
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

### Supported Currencies

`USD` · `EUR` · `GBP` · `PKR` · `AED` · `SAR` · `INR`

---

## 🗺 Route Map

```
/
├── (onboarding)
│   ├── /welcome                      First launch
│   └── /add-first-vehicle            Create first vehicle
│
├── (tabs)
│   ├── /                             🏠  Home dashboard
│   ├── /fuel                         ⛽  Fuel history
│   ├── /service                      🔧  Service history
│   ├── /analytics                    📊  Charts & stats
│   └── /garage                       🚗  All vehicles
│
└── modal                             ↑ slides over tabs
    ├── /settings                     ⚙️  Preferences
    ├── /export                       📤  CSV export
    ├── /add-vehicle                  Add vehicle
    ├── /edit-vehicle?id=<id>         Edit · delete vehicle
    └── /edit-fuel?id=<id>            Edit · delete fuel entry
```

---

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

---

## 🤝 Contributing

1. **Fork** the repository
2. **Branch** off `main` — `git checkout -b feature/my-feature`
3. **Code** — follow existing conventions:
   - All colors via `useTheme()` — no hardcoded hex values in components
   - All spacing via `space[n]` tokens — no hardcoded pixel values
   - New domain types go in `src/types/index.ts`
   - Stateless components should be `React.memo`
   - TypeScript strict mode is on — no `any`
4. **Test** on Android (and iOS if possible)
5. **PR** — clear description of what changed and why

---

<div align="center">

<br/>

Made with ☕ · Built by Aashir Athar(https://instagram.com/aashirathar) · 100% offline · No ads · No tracking

</div>