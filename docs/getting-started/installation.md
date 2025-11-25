---
sidebar_position: 2
---

# Installation

This guide walks you through installing AirPath in your Unity project.

## Install from Unity Asset Store

The recommended way to install AirPath is through the Unity Asset Store:

1. Purchase/download AirPath from the [Unity Asset Store](#) {/* TODO: Add actual link */}
2. Open your Unity project
3. Go to **Window → Package Manager**
4. Select **My Assets** from the dropdown
5. Find **AirPath** and click **Import**
6. In the Import dialog, click **Import** to add all files

:::tip Selective Import
If you only need the core runtime functionality, you can uncheck the `Samples` folder during import. The samples include demo scenes and example agents that are helpful for learning but not required for production use.
:::

## Install from Package

If you received AirPath as a `.unitypackage` file:

1. Open your Unity project
2. Go to **Assets → Import Package → Custom Package...**
3. Navigate to and select the `AirPath.unitypackage` file
4. Click **Import** in the dialog

## Project Structure

After importing, you'll find the following structure in your project:

```
Assets/
└── PlatypusIdeas/
    └── AirPath/
        ├── Runtime/           # Core pathfinding code
        │   ├── Configuration/ # ScriptableObject configs
        │   ├── Core/          # Grid, pathfinding, terrain
        │   ├── Events/        # Event system
        │   ├── Modes/         # Pathfinding modes
        │   └── Utilities/     # Helper classes
        ├── Samples/           # Demo scenes and examples
        │   └── Demo/
        │       ├── Scenes/
        │       ├── Scripts/
        │       └── Prefabs/
        └── Editor/            # Editor tools (if included)
```

## Assembly Definitions

AirPath uses Assembly Definitions for clean compilation boundaries:

| Assembly | Purpose |
|----------|---------|
| `PlatypusIdeas.AirPath.Runtime` | Core runtime code |
| `PlatypusIdeas.AirPath.Samples` | Demo and example code |

:::info Referencing AirPath
If you need to reference AirPath types from your own assembly definitions, add `PlatypusIdeas.AirPath.Runtime` to your assembly's references.
:::

## Verify Installation

To verify AirPath is installed correctly:

1. Open the Unity Console (**Window → General → Console**)
2. Check for any compilation errors
3. Go to **Assets → Create** and verify you see the **Pathfinding** submenu:
   - Pathfinding → Configuration Profile
   - Pathfinding → Configurations → Pathfinding Configuration
   - Pathfinding → Configurations → Swarm Configuration
   - Pathfinding → Configurations → Visualization Configuration

{/* 
IMAGE PLACEHOLDER: Screenshot of the Unity Create menu showing the Pathfinding submenu with all configuration options visible.
*/}

## Try the Demo Scene

AirPath includes a demo scene to help you understand the system:

1. Navigate to `Assets/PlatypusIdeas/AirPath/Samples/Demo/Scenes/`
2. Open the demo scene
3. Press **Play**
4. Click on the terrain to set a start point
5. Click again to set an end point and calculate a path

{/* 
IMAGE PLACEHOLDER: Screenshot of the demo scene in Play mode showing a calculated path over terrain with visible path line and markers.
*/}

## Dependencies Check

If you encounter compilation errors, verify all required packages are installed:

1. Open **Window → Package Manager**
2. Check that these packages appear in the list:
   - Entities
   - Burst
   - Collections
   - Mathematics
   - Input System

If any are missing, install them by clicking **+** → **Add package by name** and entering the package name (e.g., `com.unity.entities`).

## Updating AirPath

When updating to a new version:

1. **Backup your project** or use version control
2. Delete the existing `Assets/PlatypusIdeas/AirPath` folder
3. Import the new version
4. Check the [Changelog](/blog) for any breaking changes or migration steps

:::warning Configuration Assets
Your custom configuration assets (ScriptableObjects) stored outside the AirPath folder will be preserved. However, if you modified files inside the AirPath folder, those changes will be lost during update.
:::

## Next Steps

With AirPath installed, proceed to the [Quick Start](./quick-start) guide to set up your first pathfinding scene.
