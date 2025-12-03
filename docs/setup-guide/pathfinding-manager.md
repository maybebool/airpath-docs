---
sidebar_position: 2
---

# Visualization Setup

This guide covers how to set up visual feedback for AirPath, including path lines, grid overlays, and debug visualization. All visualization is optional — AirPath works without it.

## Prerequisites

Complete the [Custom Minimal Setup](./terrain-setup) first. You should have a working pathfinding setup before adding visualization.

## Creating the Visualization Configuration

1. Right-click in your Project window
2. Select **Create → Pathfinding → Configurations → Visualization Configuration**
3. Name it `VisualizationConfig`

<!-- <a href={require('@site/static/img/VisualizationConfigInsp.png').default} target="_blank">
  <img src={require('@site/static/img/VisualizationConfigInsp.png').default} alt="Visualization Configuration Inspector" width="500" />
</a> -->

## Configuration Reference

### Path Visualization Toggles


These toggles control which visual elements are active:

| Setting | Default | Description |
|---------|---------|-------------|
| **Show Path Line** | true | Display a LineRenderer along the calculated path |
| **Show Path Cell Colors** | false | Highlight start/end grid cells with colored overlays |
| **Show Debug Gizmos** | false | Draw gizmos in the Scene view for debugging |
| **Show Heatmap Grid** | false | Display terrain height sampling as a colored grid |

### Path Line Settings

Configure how the path line appears:

| Setting | Default | Description |
|---------|---------|-------------|
| **Path Line Renderer Prefab** | — | **(Required if Show Path Line is enabled)** A prefab with a LineRenderer component |
| **Path Line Height** | 15 | Height offset above terrain for the path line (0–50) |
| **Path Material** | — | Material applied to the LineRenderer |
| **Path Color** | Blue | Color of the path line |
| **Path Line Width Curve** | Linear | AnimationCurve controlling line width along the path |
| **Path Line Width** | 2 | Base width of the path line (0.1–5) |

### Grid Visualization

Configure terrain grid overlays:

| Setting | Default | Description |
|---------|---------|-------------|
| **Heat Map Cube Prefab** | — | **(Required if Show Heatmap Grid is enabled)** Prefab for grid cell visualization |
| **Path Cell Prefab** | — | **(Required if Show Path Cell Colors is enabled)** Prefab for path cell overlays |
| **Cell Transparency** | 0.8 | Alpha value for cell overlays (0.1–1) |
| **Start Cell Color** | Green | Color for the path start position |
| **End Cell Color** | Red | Color for the path end position |

### Debug Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Show Boundary Warnings** | true | Log warnings when positions are clamped to grid bounds |
| **Show Speed Indicators** | false | Display agent speed debug info |
| **Debug Path Color** | Cyan | Color used for debug gizmos |

## Setting Up Path Line Visualization

The path line shows a visible line along the calculated path. This is the most common visualization.

### Step 1: Create the LineRenderer Prefab

1. Create an empty GameObject: **GameObject → Create Empty**
2. Name it `PathLineRenderer`
3. Add a **LineRenderer** component
4. Configure the LineRenderer:
   - **Positions Size**: 0 (AirPath will populate this)
   - **Width**: Set via curve or multiplier
   - **Material**: Assign a material (Unlit or Particles work well)
5. Drag the GameObject into your Project to create a prefab
6. Delete the GameObject from the scene

### Step 2: Assign the Prefab

1. Select your `VisualizationConfig` asset
2. Assign the prefab to **Path Line Renderer Prefab**
3. Optionally assign a **Path Material**
4. Ensure **Show Path Line** is enabled

### Step 3: Connect to TerrainController

The `TerrainController` component handles visualization. Add it to your Terrain:

1. Select your **Terrain** GameObject
2. Add the `TerrainController` component (if not already present)
3. Assign your `PathfindingConfig` to **Pathfinding Configuration**
4. Assign your `VisualizationConfig` to **Visualization Configuration**

<!-- <a href={require('@site/static/img/TerrainControllerInsp.png').default} target="_blank">
  <img src={require('@site/static/img/TerrainControllerInsp.png').default} alt="TerrainController Inspector" width="500" />
</a> -->

### Step 4: Connect to PathfindingManager

1. Select your **PathfindingManager** GameObject
2. Assign the Terrain's `TerrainController` to the **Terrain Controller** field

Now when you calculate a path, a visible line will appear.

## Setting Up Grid Cell Visualization

Grid cell visualization highlights individual cells on the terrain grid.

### Creating the Prefabs

Both **Heat Map Cube Prefab** and **Path Cell Prefab** need:
- A `MeshRenderer` component
- A simple mesh (cube works well)
- A material that supports transparency

**Quick setup:**

1. Create a cube: **GameObject → 3D Object → Cube**
2. Remove the `BoxCollider` component
3. Create a new material with transparency:
   - Rendering Mode: **Transparent** (for Standard shader)
   - Or use **Unlit/Transparent** shader
4. Assign the material to the cube
5. Drag to Project to create prefab
6. Delete from scene

Create two prefabs (or reuse the same one):
- `HeatMapCube` — for terrain height visualization
- `PathCell` — for start/end position highlighting

### Assigning the Prefabs

1. Select your `VisualizationConfig` asset
2. Assign **Heat Map Cube Prefab** (if using heatmap grid)
3. Assign **Path Cell Prefab** (if using path cell colors)
4. Enable the corresponding toggles

## Visualization Features Explained

### Path Line

Shows the calculated path as a continuous line above the terrain. Useful for:
- Confirming paths are calculated correctly
- Visual feedback in games
- Debugging path issues

### Path Cell Colors

Highlights the start (green) and end (red) grid cells. Useful for:
- Seeing exact grid cell positions
- Debugging coordinate conversions
- Understanding grid resolution

### Heatmap Grid

Displays the entire terrain as colored grid cells based on sampled height. Useful for:
- Understanding how AirPath "sees" your terrain
- Debugging height sampling
- Visualizing grid resolution

:::warning Performance Note
The heatmap grid creates one GameObject per grid cell. With a 64×64 grid, that's 4,096 objects. Use only for debugging, not in production.
:::

### Debug Gizmos

Draws visualization in the Scene view (not visible in Game view). Shows:
- Path waypoints
- Grid boundaries
- Mode-specific indicators

## Minimal Visualization Setup

If you just want basic path visualization without the full setup:

1. Create `VisualizationConfig` asset
2. Enable only **Show Path Line**
3. Create a simple LineRenderer prefab
4. Assign it to the config
5. Add `TerrainController` to your Terrain with both configs assigned
6. Reference the TerrainController in PathfindingManager

Everything else is optional.

## Troubleshooting

### Path line doesn't appear

- Check **Show Path Line** is enabled
- Verify **Path Line Renderer Prefab** is assigned
- Ensure the prefab has a `LineRenderer` component
- Check the LineRenderer material is visible (not transparent/culled)

### Grid cells don't show colors

- Check **Show Path Cell Colors** is enabled
- Verify **Path Cell Prefab** is assigned
- Ensure **TerrainController** has both configurations assigned
- Check that **Show Heatmap Grid** is enabled (cells overlay the heatmap)

### "Heat map cube prefab is required" warning

Enable **Show Heatmap Grid** requires the **Heat Map Cube Prefab** to be assigned. Either assign a prefab or disable the heatmap.

### Cells are invisible

- Check your prefab material uses a transparent shader
- Verify **Cell Transparency** isn't set too low
- Ensure the material color isn't black with 0 alpha

## What's Next?

- **[Performance Tuning](../advanced/performance-tuning)** — Optimize for your use case
