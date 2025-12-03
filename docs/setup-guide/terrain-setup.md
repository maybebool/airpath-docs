---
sidebar_position: 1
---

# Custom Minimal Setup

Get AirPath running in your scene in under 5 minutes. This guide covers the minimal setup required to calculate your first aerial path.

## Prerequisites

- AirPath [installed](../getting-started/installation.md) in your project
- A scene with a Unity Terrain

:::tip No Terrain Yet?
You can quickly create a terrain via **GameObject → 3D Object → Terrain**. For testing, a flat terrain works fine — AirPath will still calculate paths.
:::

## Step 1: Create Configuration Assets

AirPath uses ScriptableObject assets for configuration. Let's create the required configs:

### Pathfinding Configuration

1. Right-click in your Project window
2. Select **Create → Pathfinding → Configurations → Pathfinding Configuration**
3. Name it `PathfindingConfig`

Leave the default values for now. Key settings you can adjust later:

| Setting | Default | Description |
|---------|---------|-------------|
| Samples Per Dimension | 64 | Grid resolution (64×64 = 4,096 cells) |
| Fly Cost Multiplier | 2.5 | How much to penalize high-altitude paths |
| Auto Clamp Out Of Bounds | true | Automatically fix out-of-bounds positions |

{/* 
IMAGE PLACEHOLDER: Screenshot of the PathfindingConfiguration inspector showing the default settings.
*/}

## Step 2: Create the Event Bus Asset

AirPath uses an event system for communication between components.

1. Right-click in your Project window
2. Select **Create → EventSystem → PathfindingEventBus**
3. Name it `PathfindingEventBus`

{/* 
IMAGE PLACEHOLDER: Screenshot showing the PathfindingEventBus asset in the Project window.
*/}

## Step 3: Set Up the Scene

Now let's add the required components to your scene.

### Add the Event Bus Handler

1. Create an empty GameObject: **GameObject → Create Empty**
2. Name it `EventBusHandler`
3. Add the `EventBusUpdateHandler` component
4. Assign your `PathfindingEventBus` asset to the **Event Bus Asset** field
5. Enable **Persist Across Scenes** if you want it to survive scene loads

{/* 
IMAGE PLACEHOLDER: Screenshot of the EventBusUpdateHandler component in the Inspector with the EventBus asset assigned.
*/}

### Add the Height Provider

1. Select your **Terrain** GameObject
2. Add the `TerrainHeightProvider` component
3. The **Terrain** field should auto-populate (it's a required component)
4. Assign your `PathfindingConfig` asset to the **Pathfinding Config** field

{/* 
IMAGE PLACEHOLDER: Screenshot of the TerrainHeightProvider component on the Terrain with the config assigned.
*/}

### Add the Pathfinding Manager

1. Create an empty GameObject: **GameObject → Create Empty**
2. Name it `PathfindingManager`
3. Add the `PathfindingManager` component
4. Assign references:
   - **Height Provider**: Your Terrain's `TerrainHeightProvider`
   - **Terrain Controller**: (Optional) For visualization features
5. Set **Starting Mode** to `MouseClick` for testing

{/* 
IMAGE PLACEHOLDER: Screenshot of the PathfindingManager component with all fields assigned.
*/}

## Step 4: Test It

1. Press **Play**
2. Click on the terrain to set a **start point** (green marker appears)
3. Click again to set an **end point** and calculate the path

You should see:
- Console logs showing path calculation time
- The path calculated between your two points

```
[PathfindingService] Initialized with grid size 64x64, cell size: 15.625, flyCostMultiplier: 2.5
[PathfindingService] Path found: 45 waypoints in 2ms
```

{/* 
IMAGE PLACEHOLDER: Screenshot of the game view showing the terrain with start marker (green cylinder), end marker (red cylinder), and a calculated path between them.
*/}

## Minimal Scene Hierarchy

Your scene hierarchy should look like this:

```
Scene
├── EventBusHandler          (EventBusUpdateHandler)
├── Terrain                  (Terrain + TerrainHeightProvider)
├── PathfindingManager       (PathfindingManager)
└── Main Camera
```

## Complete Minimal Setup Code

If you prefer to set things up via code, here's how to initialize AirPath programmatically:

```csharp
using PlatypusIdeas.AirPath.Runtime.Core.Grid;
using PlatypusIdeas.AirPath.Runtime.Core.Pathfinding;
using PlatypusIdeas.AirPath.Runtime.Core.Terrain;
using UnityEngine;

public class MinimalAirPathSetup : MonoBehaviour
{
    [SerializeField] private TerrainHeightProvider heightProvider;
    
    private PathfindingService _pathfindingService;
    
    void Start()
    {
        // Create grid configuration
        var config = new GridConfiguration(
            width: heightProvider.GridWidth,
            height: heightProvider.GridHeight,
            cellSize: heightProvider.CellSize,
            origin: heightProvider.Origin,
            flyCostMultiplier: 2.5f
        );
        
        // Initialize pathfinding service
        _pathfindingService = gameObject.AddComponent<PathfindingService>();
        _pathfindingService.Initialize(config, heightProvider);
    }
    
    public void CalculateTestPath()
    {
        // Calculate a path from world positions
        var path = _pathfindingService.CalculatePath(
            worldStart: new Vector3(100, 0, 100),
            worldEnd: new Vector3(400, 0, 400),
            heightOffset: 10f  // Fly 10 units above terrain
        );
        
        if (path != null)
        {
            Debug.Log($"Path found with {path.Count} waypoints!");
            foreach (var point in path)
            {
                Debug.Log($"  → {point}");
            }
        }
    }
}
```

## About the Terrain Setup

In the demo scene, you'll notice the Terrain GameObject has a **TerrainController** component attached. It's important to understand that this component is **not required** for AirPath to function.

### TerrainController (Demo Only)

The `TerrainController` is our demo-specific implementation that provides:
- Debug visualization (heatmap grid overlay)
- Path cell coloring for visual feedback
- Runtime grid visibility toggling

This component exists purely for demonstration and debugging purposes. **You are free to replace it with your own terrain management solution** or remove it entirely in production.

<a href={require('@site/static/img/TerrainControllerInspector.jpg').default} target="_blank">
  <img src={require('@site/static/img/TerrainControllerInspector.jpg').default} alt="Target Follow Inspector" width="500" />
</a>

### TerrainHeightProvider (Required)

The only terrain-related component that AirPath actually requires is the **TerrainHeightProvider**. This component is responsible for supplying terrain height data to the pathfinding system.

:::info Key Takeaway
**TerrainHeightProvider** = Required for pathfinding to work  
**TerrainController** = Optional demo helper for visualization
:::

If you're integrating AirPath into your own project and already have terrain management in place, you only need to ensure that a `TerrainHeightProvider` is configured. The visualization features from `TerrainController` can be useful during development but should typically be disabled or removed for release builds.

## What's Next?

You now have a working AirPath setup! Here's where to go from here:

- **[Core Concepts](../core-concepts/architecture-overview)** — Understand how AirPath works
- **[Swarm Integration](../advanced/swarm-integration)** — Make agents follow the calculated paths

## Troubleshooting Quick Start

### "PathfindingEventBus instance not initialized"

Make sure you have an `EventBusUpdateHandler` component in your scene with the `PathfindingEventBus` asset assigned.

### "heightProvider cannot be null"

The `PathfindingManager` needs a reference to a `TerrainHeightProvider`. Make sure:
1. Your Terrain has the `TerrainHeightProvider` component
2. You've assigned it to the PathfindingManager's **Height Provider** field

### Path is always null

Check that:
1. Your start and end positions are within the terrain bounds
2. The `PathfindingConfiguration` asset is assigned to the height provider
3. Console shows "Initialized with grid size..." on Play

### Performance is slow

For the quick start, try reducing the grid resolution:
1. Select your `PathfindingConfig` asset
2. Lower **Samples Per Dimension** to 32 (32×32 = 1,024 cells)

See [Performance Tuning](../advanced/performance-tuning) for detailed optimization guidance.
