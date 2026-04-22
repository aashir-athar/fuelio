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

[**Features**](#-features) · [**Screenshots**](#-interface) · [**Tech Stack**](#-tech-stack) · [**Getting Started**](#-getting-started) · [**Architecture**](#-architecture) · [**Contributing**](#-contributing)

</div>

---

<br/>

## 📱 Interface

<div align="center">

<!-- ═══════════════════════════════════════════════════════════
     PHONE MOCKUPS — SVG-based, no external images required
════════════════════════════════════════════════════════════ -->

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
```

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 700" width="1100" height="700" style="max-width:100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0e18"/>
      <stop offset="100%" stop-color="#0D1117"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#B6F24D"/>
      <stop offset="100%" stop-color="#8DC827"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E2433"/>
      <stop offset="100%" stop-color="#161B27"/>
    </linearGradient>
    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#B6F24D" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#8DC827" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4DAFFF" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#4DAFFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <clipPath id="phoneClip1"><rect x="0" y="0" width="220" height="440" rx="30" ry="30"/></clipPath>
    <clipPath id="phoneClip2"><rect x="0" y="0" width="220" height="440" rx="30" ry="30"/></clipPath>
    <clipPath id="phoneClip3"><rect x="0" y="0" width="220" height="440" rx="30" ry="30"/></clipPath>
    <clipPath id="phoneClip4"><rect x="0" y="0" width="220" height="440" rx="30" ry="30"/></clipPath>
  </defs>

  <!-- Background -->
  <rect width="1100" height="700" fill="url(#bg)"/>

  <!-- Decorative glowing orbs -->
  <circle cx="150" cy="150" r="120" fill="#B6F24D" fill-opacity="0.03"/>
  <circle cx="950" cy="550" r="150" fill="#4DAFFF" fill-opacity="0.03"/>
  <circle cx="550" cy="350" r="200" fill="#B6F24D" fill-opacity="0.015"/>

  <!-- Section Label -->
  <text x="550" y="48" text-anchor="middle" font-family="'SF Pro Display', -apple-system, sans-serif" font-size="11" fill="#4A5168" letter-spacing="3" font-weight="600">APP INTERFACE PREVIEW</text>
  <line x1="350" y1="44" x2="460" y2="44" stroke="#252B3D" stroke-width="1"/>
  <line x1="640" y1="44" x2="750" y2="44" stroke="#252B3D" stroke-width="1"/>

  <!-- ════ PHONE 1: HOME SCREEN ════ -->
  <g transform="translate(55, 80)" filter="url(#softShadow)">
    <!-- Phone shell -->
    <rect x="0" y="0" width="220" height="440" rx="30" ry="30" fill="#1a1f2e" stroke="#2a3044" stroke-width="1.5"/>
    <!-- Screen area -->
    <g clip-path="url(#phoneClip1)">
      <rect x="0" y="0" width="220" height="440" fill="#0D1117"/>
      <!-- Status bar -->
      <rect x="0" y="0" width="220" height="28" fill="#0D1117"/>
      <text x="14" y="18" font-family="sans-serif" font-size="9" fill="#F0F4FF" font-weight="600">9:41</text>
      <!-- Dynamic island -->
      <rect x="78" y="6" width="64" height="16" rx="8" fill="#0a0c12"/>
      <!-- Battery/signal icons -->
      <rect x="174" y="10" width="18" height="9" rx="2" fill="none" stroke="#F0F4FF" stroke-width="1.2"/>
      <rect x="192" y="12" width="2" height="5" rx="1" fill="#F0F4FF"/>
      <rect x="175" y="11" width="12" height="7" rx="1.5" fill="#B6F24D"/>
      <circle cx="163" cy="14" r="3" fill="#F0F4FF"/>
      <circle cx="155" cy="14" r="3" fill="#F0F4FF" fill-opacity="0.5"/>

      <!-- Header -->
      <text x="14" y="48" font-family="sans-serif" font-size="8.5" fill="#8A94A8">Welcome back</text>
      <text x="14" y="62" font-family="sans-serif" font-size="14" fill="#F0F4FF" font-weight="700">My Honda Civic</text>
      <!-- Avatar -->
      <rect x="182" y="38" width="26" height="26" rx="13" fill="#1E2433"/>
      <circle cx="195" cy="47" r="6" fill="#B6F24D" fill-opacity="0.3"/>
      <circle cx="195" cy="47" r="3" fill="#B6F24D"/>

      <!-- Vehicle Card -->
      <rect x="10" y="74" width="200" height="88" rx="14" fill="url(#cardGrad)" stroke="#252B3D" stroke-width="1"/>
      <!-- Car silhouette simplified -->
      <rect x="20" y="96" width="50" height="26" rx="4" fill="#1E2433"/>
      <rect x="22" y="88" width="44" height="14" rx="4" fill="#252B3D"/>
      <circle cx="28" cy="124" r="6" fill="#0D1117" stroke="#B6F24D" stroke-width="1.5"/>
      <circle cx="63" cy="124" r="6" fill="#0D1117" stroke="#B6F24D" stroke-width="1.5"/>
      <text x="82" y="92" font-family="sans-serif" font-size="7" fill="#8A94A8">2021 Honda Civic</text>
      <text x="82" y="104" font-family="sans-serif" font-size="9" fill="#F0F4FF" font-weight="600">Petrol · 60L tank</text>
      <!-- Fuel badge -->
      <rect x="82" y="112" width="46" height="14" rx="7" fill="#B6F24D" fill-opacity="0.15"/>
      <text x="105" y="122" text-anchor="middle" font-family="sans-serif" font-size="7.5" fill="#B6F24D" font-weight="600">⛽ Active</text>
      <!-- Odometer -->
      <text x="82" y="150" font-family="sans-serif" font-size="7" fill="#8A94A8">Odometer</text>
      <text x="138" y="150" text-anchor="end" font-family="sans-serif" font-size="8" fill="#F0F4FF" font-weight="600">42,380 km</text>

      <!-- Stats Grid -->
      <text x="14" y="176" font-family="sans-serif" font-size="7.5" fill="#8A94A8" font-weight="600" letter-spacing="1">QUICK STATS</text>
      <!-- Stat 1 -->
      <rect x="10" y="182" width="93" height="50" rx="10" fill="#161B27" stroke="#252B3D" stroke-width="1"/>
      <text x="20" y="198" font-family="sans-serif" font-size="7" fill="#8A94A8">Avg Efficiency</text>
      <text x="20" y="214" font-family="sans-serif" font-size="14" fill="#B6F24D" font-weight="700">14.2</text>
      <text x="50" y="214" font-family="sans-serif" font-size="7" fill="#8A94A8"> km/L</text>
      <text x="20" y="225" font-family="sans-serif" font-size="6.5" fill="#3DDC84">↑ Excellent</text>
      <!-- Stat 2 -->
      <rect x="116" y="182" width="93" height="50" rx="10" fill="#161B27" stroke="#252B3D" stroke-width="1"/>
      <text x="126" y="198" font-family="sans-serif" font-size="7" fill="#8A94A8">Total Spent</text>
      <text x="126" y="214" font-family="sans-serif" font-size="13" fill="#F0F4FF" font-weight="700">$284</text>
      <text x="126" y="225" font-family="sans-serif" font-size="6.5" fill="#8A94A8">this month</text>

      <!-- Service Reminder -->
      <text x="14" y="248" font-family="sans-serif" font-size="7.5" fill="#8A94A8" font-weight="600" letter-spacing="1">UPCOMING SERVICE</text>
      <rect x="10" y="254" width="200" height="38" rx="10" fill="#161B27" stroke="#F5C842" stroke-width="1" stroke-opacity="0.3"/>
      <rect x="10" y="254" width="4" height="38" rx="2" fill="#F5C842"/>
      <text x="24" y="268" font-family="sans-serif" font-size="8" fill="#F0F4FF" font-weight="600">🔧 Oil Change</text>
      <text x="24" y="281" font-family="sans-serif" font-size="7" fill="#8A94A8">Due in 620 km</text>
      <rect x="166" y="260" width="36" height="16" rx="8" fill="#F5C842" fill-opacity="0.15"/>
      <text x="184" y="270" text-anchor="middle" font-family="sans-serif" font-size="6.5" fill="#F5C842" font-weight="600">Soon</text>

      <!-- Recent Fills -->
      <text x="14" y="308" font-family="sans-serif" font-size="7.5" fill="#8A94A8" font-weight="600" letter-spacing="1">RECENT FILLS</text>
      <rect x="10" y="314" width="200" height="30" rx="8" fill="#161B27"/>
      <circle cx="24" cy="329" r="6" fill="#B6F24D" fill-opacity="0.15"/>
      <text x="24" y="332" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#B6F24D">⛽</text>
      <text x="36" y="326" font-family="sans-serif" font-size="7.5" fill="#F0F4FF" font-weight="600">45.0 L · Full tank</text>
      <text x="36" y="337" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Today · 14.8 km/L</text>
      <text x="196" y="332" text-anchor="end" font-family="sans-serif" font-size="8" fill="#F0F4FF" font-weight="600">$38</text>

      <!-- Tab Bar -->
      <rect x="0" y="400" width="220" height="40" fill="#161B27"/>
      <line x1="0" y1="400" x2="220" y2="400" stroke="#252B3D" stroke-width="1"/>
      <!-- Tab icons -->
      <text x="22" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#B6F24D">🏠</text>
      <text x="22" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#B6F24D" font-weight="600">Home</text>
      <text x="66" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">⛽</text>
      <text x="66" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Fuel</text>
      <text x="110" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">🔧</text>
      <text x="110" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Service</text>
      <text x="154" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">📊</text>
      <text x="154" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Analytics</text>
      <text x="198" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">🚗</text>
      <text x="198" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Garage</text>
    </g>
    <!-- Notch / pill indicator -->
    <rect x="75" y="432" width="70" height="4" rx="2" fill="#2a3044"/>
  </g>
  <!-- Label -->
  <text x="165" y="548" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#8A94A8" font-weight="600">Home</text>

  <!-- ════ PHONE 2: FUEL LOG ════ -->
  <g transform="translate(295, 80)" filter="url(#softShadow)">
    <rect x="0" y="0" width="220" height="440" rx="30" ry="30" fill="#1a1f2e" stroke="#2a3044" stroke-width="1.5"/>
    <g clip-path="url(#phoneClip2)">
      <rect x="0" y="0" width="220" height="440" fill="#0D1117"/>
      <!-- Status bar -->
      <rect x="0" y="0" width="220" height="28" fill="#0D1117"/>
      <text x="14" y="18" font-family="sans-serif" font-size="9" fill="#F0F4FF" font-weight="600">9:41</text>
      <rect x="78" y="6" width="64" height="16" rx="8" fill="#0a0c12"/>
      <rect x="174" y="10" width="18" height="9" rx="2" fill="none" stroke="#F0F4FF" stroke-width="1.2"/>
      <rect x="192" y="12" width="2" height="5" rx="1" fill="#F0F4FF"/>
      <rect x="175" y="11" width="12" height="7" rx="1.5" fill="#B6F24D"/>

      <!-- Page header -->
      <text x="14" y="50" font-family="sans-serif" font-size="16" fill="#F0F4FF" font-weight="700">Fuel Log</text>
      <!-- Add button -->
      <rect x="172" y="36" width="36" height="22" rx="11" fill="#B6F24D"/>
      <text x="190" y="50" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#0D1117" font-weight="700">+</text>

      <!-- Segmented control -->
      <rect x="10" y="62" width="200" height="24" rx="12" fill="#161B27"/>
      <rect x="12" y="64" width="64" height="20" rx="10" fill="#B6F24D"/>
      <text x="44" y="77" text-anchor="middle" font-family="sans-serif" font-size="7.5" fill="#0D1117" font-weight="700">All Time</text>
      <text x="111" y="77" text-anchor="middle" font-family="sans-serif" font-size="7.5" fill="#8A94A8">Month</text>
      <text x="165" y="77" text-anchor="middle" font-family="sans-serif" font-size="7.5" fill="#8A94A8">Week</text>

      <!-- Summary stat strip -->
      <rect x="10" y="94" width="200" height="38" rx="10" fill="#161B27" stroke="#252B3D" stroke-width="1"/>
      <text x="42" y="109" text-anchor="middle" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Total Fills</text>
      <text x="42" y="122" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#F0F4FF" font-weight="700">47</text>
      <line x1="72" y1="100" x2="72" y2="126" stroke="#252B3D" stroke-width="1"/>
      <text x="110" y="109" text-anchor="middle" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Total Fuel</text>
      <text x="110" y="122" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#B6F24D" font-weight="700">1,840 L</text>
      <line x1="148" y1="100" x2="148" y2="126" stroke="#252B3D" stroke-width="1"/>
      <text x="183" y="109" text-anchor="middle" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Total Cost</text>
      <text x="183" y="122" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#F0F4FF" font-weight="700">$1,540</text>

      <!-- Fuel entries list -->
      <text x="14" y="148" font-family="sans-serif" font-size="7.5" fill="#8A94A8" font-weight="600" letter-spacing="1">APRIL 2026</text>

      <!-- Entry 1 -->
      <rect x="10" y="155" width="200" height="38" rx="10" fill="#161B27"/>
      <circle cx="27" cy="174" r="9" fill="#B6F24D" fill-opacity="0.12"/>
      <text x="27" y="177" text-anchor="middle" font-family="sans-serif" font-size="10">⛽</text>
      <text x="44" y="169" font-family="sans-serif" font-size="8" fill="#F0F4FF" font-weight="600">Full Tank · 45.0 L</text>
      <text x="44" y="181" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Apr 22 · Odo 42,380</text>
      <text x="204" y="169" text-anchor="end" font-family="sans-serif" font-size="8.5" fill="#F0F4FF" font-weight="700">$38.25</text>
      <rect x="148" y="176" width="52" height="12" rx="6" fill="#3DDC84" fill-opacity="0.12"/>
      <text x="174" y="185" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#3DDC84" font-weight="600">14.8 km/L ↑</text>

      <!-- Entry 2 -->
      <rect x="10" y="198" width="200" height="38" rx="10" fill="#161B27"/>
      <circle cx="27" cy="217" r="9" fill="#4DAFFF" fill-opacity="0.12"/>
      <text x="27" y="220" text-anchor="middle" font-family="sans-serif" font-size="10">⛽</text>
      <text x="44" y="212" font-family="sans-serif" font-size="8" fill="#F0F4FF" font-weight="600">Partial · 25.0 L</text>
      <text x="44" y="224" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Apr 15 · Odo 41,730</text>
      <text x="204" y="212" text-anchor="end" font-family="sans-serif" font-size="8.5" fill="#F0F4FF" font-weight="700">$21.25</text>

      <!-- Entry 3 -->
      <rect x="10" y="240" width="200" height="38" rx="10" fill="#161B27"/>
      <circle cx="27" cy="259" r="9" fill="#B6F24D" fill-opacity="0.12"/>
      <text x="27" y="262" text-anchor="middle" font-family="sans-serif" font-size="10">⛽</text>
      <text x="44" y="254" font-family="sans-serif" font-size="8" fill="#F0F4FF" font-weight="600">Full Tank · 50.0 L</text>
      <text x="44" y="266" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Apr 8 · Odo 41,140</text>
      <text x="204" y="254" text-anchor="end" font-family="sans-serif" font-size="8.5" fill="#F0F4FF" font-weight="700">$42.50</text>
      <rect x="148" y="260" width="52" height="12" rx="6" fill="#F5C842" fill-opacity="0.12"/>
      <text x="174" y="269" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#F5C842" font-weight="600">13.6 km/L avg</text>

      <!-- Entry 4 -->
      <rect x="10" y="282" width="200" height="38" rx="10" fill="#161B27"/>
      <circle cx="27" cy="301" r="9" fill="#B6F24D" fill-opacity="0.12"/>
      <text x="27" y="304" text-anchor="middle" font-family="sans-serif" font-size="10">⛽</text>
      <text x="44" y="296" font-family="sans-serif" font-size="8" fill="#F0F4FF" font-weight="600">Full Tank · 48.5 L</text>
      <text x="44" y="308" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Apr 1 · Odo 40,500</text>
      <text x="204" y="296" text-anchor="end" font-family="sans-serif" font-size="8.5" fill="#F0F4FF" font-weight="700">$41.22</text>

      <text x="14" y="340" font-family="sans-serif" font-size="7.5" fill="#8A94A8" font-weight="600" letter-spacing="1">MARCH 2026</text>
      <rect x="10" y="346" width="200" height="38" rx="10" fill="#161B27"/>
      <circle cx="27" cy="365" r="9" fill="#B6F24D" fill-opacity="0.12"/>
      <text x="27" y="368" text-anchor="middle" font-family="sans-serif" font-size="10">⛽</text>
      <text x="44" y="360" font-family="sans-serif" font-size="8" fill="#F0F4FF" font-weight="600">Full Tank · 52.0 L</text>
      <text x="44" y="372" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Mar 28 · Odo 39,880</text>
      <text x="204" y="360" text-anchor="end" font-family="sans-serif" font-size="8.5" fill="#F0F4FF" font-weight="700">$44.20</text>

      <!-- Tab Bar -->
      <rect x="0" y="400" width="220" height="40" fill="#161B27"/>
      <line x1="0" y1="400" x2="220" y2="400" stroke="#252B3D" stroke-width="1"/>
      <text x="22" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">🏠</text>
      <text x="22" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Home</text>
      <text x="66" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#B6F24D">⛽</text>
      <text x="66" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#B6F24D">Fuel</text>
      <text x="110" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">🔧</text>
      <text x="110" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Service</text>
      <text x="154" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">📊</text>
      <text x="154" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Analytics</text>
      <text x="198" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">🚗</text>
      <text x="198" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Garage</text>
    </g>
    <rect x="75" y="432" width="70" height="4" rx="2" fill="#2a3044"/>
  </g>
  <text x="405" y="548" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#8A94A8" font-weight="600">Fuel Log</text>

  <!-- ════ PHONE 3: ANALYTICS ════ -->
  <g transform="translate(535, 80)" filter="url(#softShadow)">
    <rect x="0" y="0" width="220" height="440" rx="30" ry="30" fill="#1a1f2e" stroke="#2a3044" stroke-width="1.5"/>
    <g clip-path="url(#phoneClip3)">
      <rect x="0" y="0" width="220" height="440" fill="#0D1117"/>
      <rect x="0" y="0" width="220" height="28" fill="#0D1117"/>
      <text x="14" y="18" font-family="sans-serif" font-size="9" fill="#F0F4FF" font-weight="600">9:41</text>
      <rect x="78" y="6" width="64" height="16" rx="8" fill="#0a0c12"/>
      <rect x="174" y="10" width="18" height="9" rx="2" fill="none" stroke="#F0F4FF" stroke-width="1.2"/>
      <rect x="175" y="11" width="12" height="7" rx="1.5" fill="#B6F24D"/>

      <!-- Page header -->
      <text x="14" y="50" font-family="sans-serif" font-size="16" fill="#F0F4FF" font-weight="700">Analytics</text>

      <!-- Time range pill -->
      <rect x="10" y="58" width="200" height="22" rx="11" fill="#161B27"/>
      <rect x="12" y="60" width="44" height="18" rx="9" fill="#B6F24D"/>
      <text x="34" y="72" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#0D1117" font-weight="700">Month</text>
      <text x="80" y="72" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#8A94A8">Week</text>
      <text x="126" y="72" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#8A94A8">Year</text>
      <text x="176" y="72" text-anchor="middle" font-family="sans-serif" font-size="7" fill="#8A94A8">All time</text>

      <!-- Efficiency Score Card -->
      <rect x="10" y="88" width="200" height="56" rx="12" fill="#161B27" stroke="#B6F24D" stroke-width="1" stroke-opacity="0.3"/>
      <text x="20" y="104" font-family="sans-serif" font-size="7.5" fill="#8A94A8">Efficiency Score</text>
      <text x="20" y="122" font-family="sans-serif" font-size="22" fill="#B6F24D" font-weight="800">14.2</text>
      <text x="64" y="122" font-family="sans-serif" font-size="9" fill="#8A94A8"> km/L</text>
      <rect x="130" y="104" width="72" height="22" rx="11" fill="#3DDC84" fill-opacity="0.15"/>
      <text x="166" y="118" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#3DDC84" font-weight="700">✦ Excellent</text>
      <text x="20" y="138" font-family="sans-serif" font-size="6.5" fill="#3DDC84">↑ 3.2% above your avg</text>

      <!-- Line chart -->
      <text x="14" y="158" font-family="sans-serif" font-size="7.5" fill="#8A94A8" font-weight="600" letter-spacing="1">EFFICIENCY TREND</text>
      <rect x="10" y="164" width="200" height="80" rx="10" fill="#161B27"/>
      <!-- Y axis labels -->
      <text x="16" y="178" font-family="sans-serif" font-size="6" fill="#4A5168">16</text>
      <text x="16" y="198" font-family="sans-serif" font-size="6" fill="#4A5168">14</text>
      <text x="16" y="218" font-family="sans-serif" font-size="6" fill="#4A5168">12</text>
      <text x="16" y="238" font-family="sans-serif" font-size="6" fill="#4A5168">10</text>
      <!-- Grid lines -->
      <line x1="28" y1="176" x2="205" y2="176" stroke="#252B3D" stroke-width="0.5"/>
      <line x1="28" y1="196" x2="205" y2="196" stroke="#252B3D" stroke-width="0.5"/>
      <line x1="28" y1="216" x2="205" y2="216" stroke="#252B3D" stroke-width="0.5"/>
      <line x1="28" y1="236" x2="205" y2="236" stroke="#252B3D" stroke-width="0.5"/>
      <!-- Line chart path -->
      <polyline points="35,224 62,212 89,218 116,196 143,206 170,188 197,183" fill="none" stroke="#4DAFFF" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <!-- Area under line -->
      <polygon points="35,224 62,212 89,218 116,196 143,206 170,188 197,183 197,240 35,240" fill="#4DAFFF" fill-opacity="0.08"/>
      <!-- Data points -->
      <circle cx="35" cy="224" r="3" fill="#4DAFFF"/>
      <circle cx="62" cy="212" r="3" fill="#4DAFFF"/>
      <circle cx="89" cy="218" r="3" fill="#4DAFFF"/>
      <circle cx="116" cy="196" r="3" fill="#4DAFFF"/>
      <circle cx="143" cy="206" r="3" fill="#4DAFFF"/>
      <circle cx="170" cy="188" r="3" fill="#4DAFFF"/>
      <circle cx="197" cy="183" r="4" fill="#B6F24D" filter="url(#glow)"/>
      <!-- X labels -->
      <text x="35" y="248" text-anchor="middle" font-family="sans-serif" font-size="5.5" fill="#4A5168">Oct</text>
      <text x="62" y="248" text-anchor="middle" font-family="sans-serif" font-size="5.5" fill="#4A5168">Nov</text>
      <text x="89" y="248" text-anchor="middle" font-family="sans-serif" font-size="5.5" fill="#4A5168">Dec</text>
      <text x="116" y="248" text-anchor="middle" font-family="sans-serif" font-size="5.5" fill="#4A5168">Jan</text>
      <text x="143" y="248" text-anchor="middle" font-family="sans-serif" font-size="5.5" fill="#4A5168">Feb</text>
      <text x="170" y="248" text-anchor="middle" font-family="sans-serif" font-size="5.5" fill="#4A5168">Mar</text>
      <text x="197" y="248" text-anchor="middle" font-family="sans-serif" font-size="5.5" fill="#B6F24D">Apr</text>

      <!-- Bar chart -->
      <text x="14" y="264" font-family="sans-serif" font-size="7.5" fill="#8A94A8" font-weight="600" letter-spacing="1">MONTHLY SPEND</text>
      <rect x="10" y="270" width="200" height="74" rx="10" fill="#161B27"/>
      <!-- Bars -->
      <rect x="26" y="310" width="16" height="22" rx="3" fill="url(#barGrad)" fill-opacity="0.7"/>
      <rect x="52" y="300" width="16" height="32" rx="3" fill="url(#barGrad)" fill-opacity="0.7"/>
      <rect x="78" y="306" width="16" height="26" rx="3" fill="url(#barGrad)" fill-opacity="0.7"/>
      <rect x="104" y="292" width="16" height="40" rx="3" fill="url(#barGrad)" fill-opacity="0.7"/>
      <rect x="130" y="304" width="16" height="28" rx="3" fill="url(#barGrad)" fill-opacity="0.7"/>
      <rect x="156" y="297" width="16" height="35" rx="3" fill="url(#barGrad)" fill-opacity="0.7"/>
      <rect x="182" y="282" width="16" height="50" rx="3" fill="#B6F24D"/>
      <!-- Labels -->
      <text x="34" y="340" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#4A5168">Oct</text>
      <text x="60" y="340" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#4A5168">Nov</text>
      <text x="86" y="340" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#4A5168">Dec</text>
      <text x="112" y="340" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#4A5168">Jan</text>
      <text x="138" y="340" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#4A5168">Feb</text>
      <text x="164" y="340" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#4A5168">Mar</text>
      <text x="190" y="340" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#B6F24D">Apr</text>
      <text x="190" y="279" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#B6F24D" font-weight="700">$284</text>

      <!-- Mini stats row -->
      <rect x="10" y="352" width="93" height="34" rx="8" fill="#161B27" stroke="#252B3D" stroke-width="1"/>
      <text x="57" y="364" text-anchor="middle" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Cost/km</text>
      <text x="57" y="378" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#F0F4FF" font-weight="700">$0.19</text>
      <rect x="116" y="352" width="93" height="34" rx="8" fill="#161B27" stroke="#252B3D" stroke-width="1"/>
      <text x="163" y="364" text-anchor="middle" font-family="sans-serif" font-size="6.5" fill="#8A94A8">Total km</text>
      <text x="163" y="378" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#B6F24D" font-weight="700">1,492</text>

      <!-- Tab Bar -->
      <rect x="0" y="400" width="220" height="40" fill="#161B27"/>
      <line x1="0" y1="400" x2="220" y2="400" stroke="#252B3D" stroke-width="1"/>
      <text x="22" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">🏠</text>
      <text x="22" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Home</text>
      <text x="66" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">⛽</text>
      <text x="66" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Fuel</text>
      <text x="110" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">🔧</text>
      <text x="110" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Service</text>
      <text x="154" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#B6F24D">📊</text>
      <text x="154" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#B6F24D">Analytics</text>
      <text x="198" y="415" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">🚗</text>
      <text x="198" y="426" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#4A5168">Garage</text>
    </g>
    <rect x="75" y="432" width="70" height="4" rx="2" fill="#2a3044"/>
  </g>
  <text x="645" y="548" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#8A94A8" font-weight="600">Analytics</text>

  <!-- ════ PHONE 4: ADD FUEL SHEET ════ -->
  <g transform="translate(775, 80)" filter="url(#softShadow)">
    <rect x="0" y="0" width="220" height="440" rx="30" ry="30" fill="#1a1f2e" stroke="#2a3044" stroke-width="1.5"/>
    <g clip-path="url(#phoneClip4)">
      <rect x="0" y="0" width="220" height="440" fill="#0D1117"/>
      <rect x="0" y="0" width="220" height="28" fill="#0D1117"/>
      <text x="14" y="18" font-family="sans-serif" font-size="9" fill="#F0F4FF" font-weight="600">9:41</text>
      <rect x="78" y="6" width="64" height="16" rx="8" fill="#0a0c12"/>
      <rect x="174" y="10" width="18" height="9" rx="2" fill="none" stroke="#F0F4FF" stroke-width="1.2"/>
      <rect x="175" y="11" width="12" height="7" rx="1.5" fill="#B6F24D"/>

      <!-- Dimmed background -->
      <rect x="0" y="28" width="220" height="196" fill="#000000" fill-opacity="0.5"/>
      <!-- Blurred tab bar still visible -->
      <text x="110" y="80" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#8A94A8" fill-opacity="0.4">Home · My Honda Civic</text>

      <!-- Bottom Sheet -->
      <rect x="0" y="170" width="220" height="270" rx="20" fill="#161B27"/>
      <!-- Drag handle -->
      <rect x="90" y="178" width="40" height="4" rx="2" fill="#252B3D"/>

      <!-- Sheet header -->
      <text x="110" y="200" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#F0F4FF" font-weight="700">Add Fuel Entry</text>

      <!-- Full / Partial toggle -->
      <rect x="14" y="210" width="192" height="24" rx="12" fill="#1E2433"/>
      <rect x="16" y="212" width="92" height="20" rx="10" fill="#B6F24D"/>
      <text x="62" y="225" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#0D1117" font-weight="700">Full Tank</text>
      <text x="158" y="225" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#8A94A8">Partial</text>

      <!-- Input: Liters -->
      <text x="14" y="248" font-family="sans-serif" font-size="7.5" fill="#8A94A8">Liters</text>
      <rect x="14" y="252" width="192" height="30" rx="8" fill="#1E2433" stroke="#B6F24D" stroke-width="1.5"/>
      <text x="24" y="270" font-family="sans-serif" font-size="12" fill="#F0F4FF" font-weight="600">45.0</text>
      <text x="190" y="270" text-anchor="end" font-family="sans-serif" font-size="9" fill="#8A94A8">L</text>

      <!-- Input: Price per liter -->
      <text x="14" y="294" font-family="sans-serif" font-size="7.5" fill="#8A94A8">Price per Liter</text>
      <rect x="14" y="298" width="192" height="30" rx="8" fill="#1E2433" stroke="#252B3D" stroke-width="1"/>
      <text x="24" y="316" font-family="sans-serif" font-size="12" fill="#F0F4FF" font-weight="600">0.85</text>
      <text x="190" y="316" text-anchor="end" font-family="sans-serif" font-size="9" fill="#8A94A8">$/L</text>

      <!-- Computed total -->
      <rect x="14" y="334" width="192" height="22" rx="8" fill="#B6F24D" fill-opacity="0.08"/>
      <text x="20" y="348" font-family="sans-serif" font-size="7.5" fill="#8A94A8">Total Cost</text>
      <text x="200" y="348" text-anchor="end" font-family="sans-serif" font-size="9" fill="#B6F24D" font-weight="700">$38.25</text>

      <!-- Odometer input -->
      <text x="14" y="370" font-family="sans-serif" font-size="7.5" fill="#8A94A8">Odometer</text>
      <rect x="14" y="374" width="192" height="30" rx="8" fill="#1E2433" stroke="#252B3D" stroke-width="1"/>
      <text x="24" y="392" font-family="sans-serif" font-size="12" fill="#F0F4FF" font-weight="600">42,380</text>
      <text x="190" y="392" text-anchor="end" font-family="sans-serif" font-size="9" fill="#8A94A8">km</text>

      <!-- Save button -->
      <rect x="14" y="408" width="192" height="24" rx="12" fill="#B6F24D"/>
      <text x="110" y="423" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#0D1117" font-weight="800">Save Entry</text>
    </g>
    <rect x="75" y="432" width="70" height="4" rx="2" fill="#2a3044"/>
  </g>
  <text x="885" y="548" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#8A94A8" font-weight="600">Add Fuel</text>

  <!-- Bottom labels row -->
  <text x="550" y="590" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#4A5168">Dark theme · Lime accent (#B6F24D) · Expo SDK 54 · React Native New Architecture</text>
</svg>

```
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

</div>

<br/>

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
