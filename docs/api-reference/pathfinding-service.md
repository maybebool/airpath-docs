---
sidebar_position: 1
---

# PathfindingService

The `PathfindingService` is the core pathfinding engine. It handles grid initialization, A* path calculation, and coordinate conversions. While most users interact with `PathfindingManager`, you can use `PathfindingService` directly for custom implementations.

## Namespace

```csharp
PlatypusIdeas.AirPath.Runtime.Core.Pathfinding
```

## Class Definition

```csharp
public class PathfindingService : MonoBehaviour
```

## Initialization

### Initialize

```csharp
public void Initialize(GridConfiguration config, IHeightProvider heightProvider)
```

Initializes the pathfinding service with grid configuration and height data.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `GridConfiguration` | Grid settings (size, cell size, origin, cost multiplier) |
| `heightProvider` | `IHeightProvider` | Source of terrain height data |

**Example:**

```csharp
using PlatypusIdeas.AirPath.Runtime.Core.Grid;
using PlatypusIdeas.AirPath.Runtime.Core.Pathfinding;
using PlatypusIdeas.AirPath.Runtime.Core.Terrain;
using UnityEngine;

public class PathfindingSetup : MonoBehaviour
{
    [SerializeField] private TerrainHeightProvider heightProvider;
    
    private PathfindingService _pathfindingService;
    
    void Start()
    {
        var config = new GridConfiguration(
            width: heightProvider.GridWidth,
            height: heightProvider.GridHeight,
            cellSize: heightProvider.CellSize,
            origin: heightProvider.Origin,
            flyCostMultiplier: 2.5f
        );
        
        _pathfindingService = gameObject.AddComponent<PathfindingService>();
        _pathfindingService.Initialize(config, heightProvider);
    }
}
```

:::caution
`Initialize()` must be called before any other methods. Calling `CalculatePath()` without initialization returns `null`.
:::

## Path Calculation

### CalculatePath (Grid Positions)

```csharp
public List<Vector3> CalculatePath(Vector2Int startPos, Vector2Int endPos, float heightOffset = 0)
```

Calculates a path between two grid positions.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `startPos` | `Vector2Int` | Start position in grid coordinates |
| `endPos` | `Vector2Int` | End position in grid coordinates |
| `heightOffset` | `float` | Height above terrain for path points (default: 0) |

**Returns:** `List<Vector3>` of world positions forming the path, or `null` if no path found.

**Example:**

```csharp
var path = _pathfindingService.CalculatePath(
    startPos: new Vector2Int(10, 10),
    endPos: new Vector2Int(50, 45),
    heightOffset: 10f
);

if (path != null)
{
    Debug.Log($"Path found with {path.Count} waypoints");
    foreach (var waypoint in path)
    {
        Debug.Log($"  → {waypoint}");
    }
}
else
{
    Debug.Log("No path found");
}
```

---

### CalculatePath (World Positions)

```csharp
public List<Vector3> CalculatePath(Vector3 worldStart, Vector3 worldEnd, float heightOffset = 0)
```

Calculates a path between two world positions. Automatically converts to grid coordinates.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `worldStart` | `Vector3` | Start position in world space |
| `worldEnd` | `Vector3` | End position in world space |
| `heightOffset` | `float` | Height above terrain for path points (default: 0) |

**Returns:** `List<Vector3>` of world positions forming the path, or `null` if no path found.

**Example:**

```csharp
var agentPosition = transform.position;
var targetPosition = target.transform.position;

var path = _pathfindingService.CalculatePath(
    worldStart: agentPosition,
    worldEnd: targetPosition,
    heightOffset: 15f  // Fly 15 units above terrain
);
```

:::tip
Use the world position overload when working with GameObjects. It handles coordinate conversion internally.
:::

## Coordinate Conversion

### WorldToGridPosition

```csharp
public Vector2Int WorldToGridPosition(Vector3 worldPos)
```

Converts a world position to grid coordinates. If `AutoClampOutOfBounds` is enabled, out-of-bounds positions are clamped to valid grid edges.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `worldPos` | `Vector3` | Position in world space |

**Returns:** `Vector2Int` grid position.

**Example:**

```csharp
var gridPos = _pathfindingService.WorldToGridPosition(transform.position);
Debug.Log($"Agent is at grid cell ({gridPos.x}, {gridPos.y})");
```

---

### WorldToGridPositionSafe

```csharp
public Vector2Int WorldToGridPositionSafe(Vector3 worldPos, out bool wasOutOfBounds)
```

Converts a world position to grid coordinates with out-of-bounds detection.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `worldPos` | `Vector3` | Position in world space |
| `wasOutOfBounds` | `out bool` | Set to `true` if position was outside grid bounds |

**Returns:** `Vector2Int` grid position (clamped if out of bounds).

**Example:**

```csharp
var gridPos = _pathfindingService.WorldToGridPositionSafe(
    target.position, 
    out bool wasOutOfBounds
);

if (wasOutOfBounds)
{
    Debug.LogWarning("Target is outside pathfinding grid!");
}
```

---

### GridToWorldPosition

```csharp
public Vector3 GridToWorldPosition(Vector2Int gridPos, float yOffset = 0)
```

Converts grid coordinates to a world position.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `gridPos` | `Vector2Int` | Position in grid coordinates |
| `yOffset` | `float` | Height offset to add (default: 0) |

**Returns:** `Vector3` world position.

**Example:**

```csharp
var gridPos = new Vector2Int(32, 32);
var worldPos = _pathfindingService.GridToWorldPosition(gridPos, yOffset: 10f);
Debug.Log($"Grid center is at world position {worldPos}");
```

## Bounds Checking

### IsValidGridPosition

```csharp
public bool IsValidGridPosition(Vector2Int pos)
```

Checks if a grid position is within valid bounds.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `pos` | `Vector2Int` | Grid position to check |

**Returns:** `true` if position is valid, `false` otherwise.

**Example:**

```csharp
var targetGrid = _pathfindingService.WorldToGridPosition(target.position);

if (!_pathfindingService.IsValidGridPosition(targetGrid))
{
    Debug.LogWarning("Target is outside the pathfinding grid");
    return;
}
```

---

### ClampToValidGridPosition

```csharp
public Vector2Int ClampToValidGridPosition(Vector2Int pos)
```

Clamps a grid position to valid bounds.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `pos` | `Vector2Int` | Grid position to clamp |

**Returns:** `Vector2Int` clamped to valid grid bounds.

**Example:**

```csharp
var rawGridPos = new Vector2Int(100, -5);  // Potentially out of bounds
var validPos = _pathfindingService.ClampToValidGridPosition(rawGridPos);
```

---

### GetBoundaryHandler

```csharp
public GridBoundaryHandler GetBoundaryHandler()
```

Gets the boundary handler for advanced operations.

**Returns:** `GridBoundaryHandler` instance.

**Example:**

```csharp
var boundaryHandler = _pathfindingService.GetBoundaryHandler();
Debug.Log(boundaryHandler.GetBoundaryInfo());
```

## Inspector Properties

When added as a component, PathfindingService exposes:

| Field | Default | Description |
|-------|---------|-------------|
| **Auto Clamp Out Of Bounds** | true | Automatically clamp invalid positions to grid edges |
| **Log Boundary Warnings** | false | Log warnings when positions are clamped |

## Performance Notes

**Threading:** `CalculatePath()` is synchronous but uses Unity's Job System internally. The A* algorithm runs as a Burst-compiled job on a worker thread, then completes before returning.

**Blocking:** The method blocks the calling thread until the path is calculated. For very large grids, consider calling from a coroutine or limiting frequency.

**Memory:** PathfindingService pre-allocates NativeArrays for pathfinding data. These are reused across calls to avoid GC allocation.

**Typical Performance:**
```
[PathfindingService] Initialized with grid size 64x64, cell size: 15.625, flyCostMultiplier: 2.5
[PathfindingService] Path found: 45 waypoints in 2ms
```


## See Also

- [PathfindingManager](../setup-guide/pathfinding-manager) — High-level manager with mode support
- [IHeightProvider](./height-provider-interface) — Height data interface
- [GridBoundaryHandler](./grid-utilities) — Boundary handling utilities
- [Events](./events) — Path calculation events