---
sidebar_position: 3
---

# Quick Start

Get AirPath running in your scene in under 5 minutes. This guide covers the minimal setup required to calculate your first aerial path.

## Prerequisites

- AirPath [installed](./installation) in your project
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
2. Add the `ProjectTerrainHeightProvider` component
3. The **Terrain** field should auto-populate
4. Assign your `PathfindingConfig` asset to the **Pathfinding Config** field

{/* 
IMAGE PLACEHOLDER: Screenshot of the ProjectTerrainHeightProvider component on the Terrain with the config assigned.
*/}

### Add the Pathfinding Manager

1. Create an empty GameObject: **GameObject → Create Empty**
2. Name it `PathfindingManager`
3. Add the `PathfindingManager` component
4. Assign references:
   - **Height Provider**: Your Terrain's `ProjectTerrainHeightProvider`
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
├── Terrain                  (Terrain + ProjectTerrainHeightProvider)
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
    [SerializeField] private ProjectTerrainHeightProvider heightProvider;
    
    private PathfindingService _pathfindingService;
    
    void Start()
    {
        // Create grid configuration
        var config = new GridConfiguration(
            width: 64,
            height: 64,
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

## What's Next?

You now have a working AirPath setup! Here's where to go from here:

- **[Core Concepts](../core-concepts/architecture-overview)** — Understand how AirPath works
- **[Configuration Assets](../setup-guide/configuration-assets)** — Learn about all configuration options
- **[Swarm Integration](../advanced/swarm-integration)** — Make agents follow the calculated paths

## Troubleshooting Quick Start

### "PathfindingEventBus instance not initialized"

Make sure you have an `EventBusUpdateHandler` component in your scene with the `PathfindingEventBus` asset assigned.

### "heightProvider cannot be null"

The `PathfindingManager` needs a reference to a `ProjectTerrainHeightProvider`. Make sure:
1. Your Terrain has the `ProjectTerrainHeightProvider` component
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
