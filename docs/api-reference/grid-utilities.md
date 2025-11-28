---
sidebar_position: 5
---

# Grid Utilities

This page documents the grid-related utilities for advanced users who need direct control over coordinate conversion and boundary handling. Most users won't need these — `PathfindingService` handles grid operations internally.

## Namespace

```csharp
PlatypusIdeas.AirPath.Runtime.Core.Grid
```

## GridConfiguration

A Burst-compatible struct that holds all parameters needed to initialize a pathfinding grid.

### Definition

```csharp
public struct GridConfiguration
{
    public readonly int Width;
    public readonly int Height;
    public readonly float CellSize;
    public float3 Origin;
    public readonly float FlyCostMultiplier;
    
    public readonly int TotalNodes { get; }
    public readonly bool IsValid { get; }
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `Width` | `int` | Number of cells along the X-axis |
| `Height` | `int` | Number of cells along the Z-axis |
| `CellSize` | `float` | Size of each cell in world units |
| `Origin` | `float3` | World position of grid corner (0,0) |
| `FlyCostMultiplier` | `float` | Cost multiplier for height-based pathfinding |
| `TotalNodes` | `int` | Total cells in grid (`Width * Height`) |
| `IsValid` | `bool` | `true` if Width, Height, and CellSize are positive |

### Constructor

```csharp
public GridConfiguration(int width, int height, float cellSize, float3 origin, float flyCostMultiplier)
```

### Example

```csharp
using PlatypusIdeas.AirPath.Runtime.Core.Grid;
using Unity.Mathematics;

// Create configuration manually
var config = new GridConfiguration(
    width: 64,
    height: 64,
    cellSize: 15.625f,
    origin: new float3(0, 0, 0),
    flyCostMultiplier: 2.5f
);

// Or derive from height provider
var config = new GridConfiguration(
    width: heightProvider.GridWidth,
    height: heightProvider.GridHeight,
    cellSize: heightProvider.CellSize,
    origin: heightProvider.Origin,
    flyCostMultiplier: 2.5f
);

// Validate before use
if (!config.IsValid)
{
    Debug.LogError("Invalid grid configuration!");
    return;
}

Debug.Log($"Grid has {config.TotalNodes} cells");
```

---

## GridBoundaryHandler

Utility class for coordinate conversion and boundary validation. Access it via `PathfindingService.GetBoundaryHandler()`.

### Getting the Handler

```csharp
var boundaryHandler = pathfindingService.GetBoundaryHandler();
```

### Methods

#### ClampToValidGrid

Clamps a grid position to valid boundaries.

```csharp
public Vector2Int ClampToValidGrid(Vector2Int position)
public int2 ClampToValidGrid(int2 position)  // DOTS version
```

**Example:**

```csharp
var rawPos = new Vector2Int(100, -5);  // Out of bounds
var validPos = boundaryHandler.ClampToValidGrid(rawPos);
// validPos = (63, 0) for a 64x64 grid
```

---

#### IsValidGridPosition

Checks if a position is within grid boundaries.

```csharp
public bool IsValidGridPosition(Vector2Int position)
public bool IsValidGridPosition(int2 position)  // DOTS version
```

**Example:**

```csharp
var pos = new Vector2Int(32, 32);
if (boundaryHandler.IsValidGridPosition(pos))
{
    // Safe to use this position
}
```

---

#### WorldToGridPositionClamped

Converts world position to grid coordinates, clamping to valid bounds.

```csharp
public Vector2Int WorldToGridPositionClamped(Vector3 worldPos)
```

**Example:**

```csharp
var worldPos = transform.position;
var gridPos = boundaryHandler.WorldToGridPositionClamped(worldPos);
// Always returns a valid grid position
```

---

#### WorldToGridPositionUnclamped

Converts world position to grid coordinates without clamping. May return out-of-bounds values.

```csharp
public Vector2Int WorldToGridPositionUnclamped(Vector3 worldPos)
```

**Example:**

```csharp
var gridPos = boundaryHandler.WorldToGridPositionUnclamped(worldPos);
// May be negative or exceed grid bounds
```

---

#### GetNearestValidGridPosition

Converts world position to grid coordinates and reports whether clamping occurred.

```csharp
public (Vector2Int gridPos, bool wasOutOfBounds) GetNearestValidGridPosition(Vector3 worldPos)
```

**Example:**

```csharp
var (gridPos, wasOutOfBounds) = boundaryHandler.GetNearestValidGridPosition(target.position);

if (wasOutOfBounds)
{
    Debug.LogWarning($"Target is outside grid, clamped to {gridPos}");
}
```

---

#### DistanceToNearestBoundary

Calculates how many cells a position is from the nearest grid edge.

```csharp
public float DistanceToNearestBoundary(Vector2Int position)
```

**Example:**

```csharp
var distance = boundaryHandler.DistanceToNearestBoundary(agentGridPos);

if (distance < 5)
{
    Debug.Log("Agent is near grid edge");
}
```

---

#### GetBoundaryInfo

Returns a debug string describing grid bounds.

```csharp
public string GetBoundaryInfo()
```

**Example:**

```csharp
Debug.Log(boundaryHandler.GetBoundaryInfo());
// Output: "Grid Boundaries: (0,0) to (63,63)"

### Conversion Formulas

**World → Grid:**
```csharp
gridX = Floor((worldPos.x - origin.x) / cellSize)
gridY = Floor((worldPos.z - origin.z) / cellSize)
```

**Grid → World (cell center):**
```csharp
worldX = origin.x + (gridX + 0.5) * cellSize
worldY = heightOffset  // or terrain height
worldZ = origin.z + (gridY + 0.5) * cellSize
```

## Internal Classes

These classes are used internally and not intended for direct use:

| Class | Purpose |
|-------|---------|
| `PathGridData` | NativeArray-based grid storage for Burst jobs |
| `PathNodeComponent` | Per-node pathfinding state |
| `PathNodeCost` | Per-node cost data (G, H, F costs) |
| `PathGridAuthoring` | ECS authoring component |

## See Also

- [PathfindingService](./pathfinding-service) — Main pathfinding API
- [IHeightProvider](./height-provider-interface) — Height data source
- [Core Concepts: Grid System](../core-concepts/grid-system) — Conceptual overview