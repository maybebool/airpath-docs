---
sidebar_position: 1
---

# Requirements

Before installing AirPath, ensure your project meets the following requirements.

## Unity Version

| Requirement | Version |
|-------------|---------|
| **Recommended** | Unity 6 (6000.0.58f2) or later |

AirPath uses Unity's DOTS packages which require Unity 2022.3 or newer. For the best experience and latest DOTS improvements, Unity 6 is recommended.

## Required Packages

AirPath depends on the following Unity packages. These will be installed automatically when you import AirPath, but you can also install them manually via the Package Manager.

| Package | Minimum Version | Purpose |
|---------|-----------------|---------|
| `com.unity.entities` | 1.3.14+ | Entity Component System |
| `com.unity.burst` | 1.8.0+ | High-performance compilation |
| `com.unity.collections` | 2.1.0+ | Native containers |
| `com.unity.mathematics` | 1.2.0+ | SIMD math library |
| `com.unity.inputsystem` | 1.7.0+ | Input handling for demo modes |

:::tip Package Installation
If you need to install these packages manually, open **Window → Package Manager**, click the **+** button, select **Add package by name**, and enter the package identifier (e.g., `com.unity.entities`).
:::

## Render Pipeline Compatibility

AirPath's core pathfinding system is render-pipeline agnostic. The visualization components (debug lines, grid display) work with:

| Render Pipeline | Status |
|-----------------|--------|
| Built-in Render Pipeline | ✅ Fully supported |
| Universal Render Pipeline (URP) | ✅ Fully supported |
| High Definition Render Pipeline (HDRP) | ✅ Fully supported |

:::note Visualization Materials
The Demo folder provides prefabs and materials for all 3 render pipelines. Also, there are ready to use scriptable objects for the visualizations for each render pipeline.
:::

## Platform Support

AirPath's Burst-compiled jobs run on all platforms that support Burst compilation:

| Platform | Burst Support | Status |
|----------|---------------|--------|
| Windows (x64) | ✅ | Fully supported |
| macOS (Intel & Apple Silicon) | ✅ | Fully supported |
| Linux (x64) | ✅ | Fully supported |
| iOS | ✅ | Fully supported |
| Android (ARM64, ARMv7) | ✅ | Fully supported |
| WebGL | ⚠️ | Limited (no threading) |
| Consoles | ✅ | Supported where Burst is available |

:::warning WebGL Limitations
On WebGL, Burst compilation works but multi-threading is not available. Pathfinding will run synchronously on the main thread, which may impact performance for large grids or frequent recalculations.
:::

## Project Settings

AirPath works with default Unity project settings. However, for best results:

**Scripting Backend**

For builds, use **IL2CPP** scripting backend to enable Burst AOT compilation:

1. Go to **Edit → Project Settings → Player**
2. Under **Other Settings**, set **Scripting Backend** to **IL2CPP**

**API Compatibility Level**

Use **.NET Standard 2.1** or **.NET Framework** for full compatibility:

1. Go to **Edit → Project Settings → Player**
2. Under **Other Settings**, set **Api Compatibility Level** to **.NET Standard 2.1**

## Checking Your Setup

After ensuring you meet these requirements, you're ready to [install AirPath](./installation).

{/* 
IMAGE PLACEHOLDER: Screenshot of the Unity Package Manager showing the required DOTS packages installed (Entities, Burst, Collections, Mathematics).
*/}
