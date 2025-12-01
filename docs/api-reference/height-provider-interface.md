---
sidebar_position: 2
---

# IHeightProvider Interface

The `IHeightProvider` interface allows AirPath to work with any height data source — not just Unity Terrain. Implement this interface to integrate AirPath with custom terrain systems, procedural generation, mesh-based landscapes, or voxel worlds.

## Namespace

```csharp
PlatypusIdeas.AirPath.Runtime.Core.Terrain
```

## Interface Definition

```csharp
public interface IHeightProvider
{
    float GetHeightAt(int x, int y);
    float[,] SampleHeights(int samplesPerDimension);
    float CellSize { get; }
    Vector3 Origin { get; }
    int GridWidth { get; }
    int GridHeight { get; }
}
```

## Properties

### CellSize

```csharp
float CellSize { get; }
```

Size of each grid cell in world units.

**Example:** If your terrain is 100 units wide and the grid is 64 cells, `CellSize = 100 / 64 = 1.5625`

---

### Origin

```csharp
Vector3 Origin { get; }
```

Origin point of the grid in world space — typically the bottom-left corner. This is where grid position `(0, 0)` maps to in the world.

---

### GridWidth

```csharp
int GridWidth { get; }
```

Width of the grid in cells. Used for bounds checking.

**Example:** For a 64×64 grid, `GridWidth = 64`

---

### GridHeight

```csharp
int GridHeight { get; }
```

Height of the grid in cells. Used for bounds checking.

:::note
`GridHeight` refers to the grid's Z-axis dimension in world space, not the Y-axis (elevation). The naming follows 2D grid conventions where "height" means the second dimension.
:::

## Methods

### GetHeightAt

```csharp
float GetHeightAt(int x, int y);
```

Gets the terrain height at a specific grid position.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `x` | `int` | Grid X coordinate (0 to GridWidth - 1) |
| `y` | `int` | Grid Y coordinate (0 to GridHeight - 1) — this is grid space, not world Y |

**Returns:** Height in world units (Unity's Y-axis)

---

### SampleHeights

```csharp
float[,] SampleHeights(int samplesPerDimension);
```

Samples heights for the entire grid at once. This is called once during initialization and is more efficient than calling `GetHeightAt()` repeatedly.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `samplesPerDimension` | `int` | Number of samples per dimension (e.g., 64 creates a 64×64 grid) |

**Returns:** 2D array of height values `[x, y]` in world units

## Built-in Implementation

AirPath includes `TerrainHeightProvider` for Unity Terrain. See [Custom Minimal Setup](../setup-guide/terrain-setup) for usage.

## Custom Implementation Example

Here's a complete example implementing `IHeightProvider` for a Perlin noise heightmap:

```csharp
using PlatypusIdeas.AirPath.Runtime.Core.Terrain;
using UnityEngine;

public class PerlinHeightProvider : MonoBehaviour, IHeightProvider
{
    [Header("Grid Settings")]
    [SerializeField] private int gridSize = 64;
    [SerializeField] private float terrainSize = 100f;
    
    [Header("Noise Settings")]
    [SerializeField] private float noiseScale = 20f;
    [SerializeField] private float heightMultiplier = 50f;
    [SerializeField] private Vector2 noiseOffset;
    
    private float[,] _cachedHeights;
    private bool _isCached;
    
    // IHeightProvider Properties
    public float CellSize => terrainSize / gridSize;
    public Vector3 Origin => transform.position;
    public int GridWidth => gridSize;
    public int GridHeight => gridSize;
    
    public float GetHeightAt(int x, int y)
    {
        // Bounds check
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize)
        {
            Debug.LogWarning($"Position ({x},{y}) out of bounds");
            return 0f;
        }
        
        // Use cached data if available
        if (_isCached)
        {
            return _cachedHeights[x, y];
        }
        
        // Calculate height from Perlin noise
        return CalculateHeight(x, y);
    }
    
    public float[,] SampleHeights(int samplesPerDimension)
    {
        var heights = new float[samplesPerDimension, samplesPerDimension];
        
        for (int y = 0; y < samplesPerDimension; y++)
        {
            for (int x = 0; x < samplesPerDimension; x++)
            {
                heights[x, y] = CalculateHeight(x, y);
            }
        }
        
        // Cache the results
        _cachedHeights = heights;
        _isCached = true;
        
        return heights;
    }
    
    private float CalculateHeight(int x, int y)
    {
        float sampleX = (x / (float)gridSize * noiseScale) + noiseOffset.x;
        float sampleY = (y / (float)gridSize * noiseScale) + noiseOffset.y;
        
        float noise = Mathf.PerlinNoise(sampleX, sampleY);
        return noise * heightMultiplier;
    }
    
    /// <summary>
    /// Call this if your terrain changes at runtime
    /// </summary>
    public void InvalidateCache()
    {
        _isCached = false;
        _cachedHeights = null;
    }
}
```

## Implementation Guidelines

### Performance

- **Cache heights** — `SampleHeights()` is called once at initialization. Cache the results for `GetHeightAt()` calls.
- **Bounds checking** — Validate grid coordinates before accessing data.
- **Thread safety** — `GetHeightAt()` may be called from jobs. Avoid modifying shared state.

### Coordinate System

```
World Space:           Grid Space:
    Y (up)                 
    │                    ┌───────────► X (GridWidth)
    │                    │
    │                    │
    └────────► X         │
   /                     ▼
  Z                      Y (GridHeight)
Origin                 (0,0)
```

- Grid `(0, 0)` corresponds to `Origin` in world space
- Grid `x` maps to world X-axis
- Grid `y` maps to world Z-axis
- Height values are world Y-axis

### Integration

1. Create a MonoBehaviour implementing `IHeightProvider`
2. Attach it to a GameObject in your scene
3. Reference it in `PathfindingManager`'s **Height Provider** field

```csharp
// In PathfindingManager or your initialization code
[SerializeField] private MonoBehaviour heightProviderComponent;

void Start()
{
    var heightProvider = heightProviderComponent as IHeightProvider;
    if (heightProvider == null)
    {
        Debug.LogError("Height provider must implement IHeightProvider!");
        return;
    }
    
    // Use with PathfindingService
    var config = new GridConfiguration(
        heightProvider.GridWidth,
        heightProvider.GridHeight,
        heightProvider.CellSize,
        heightProvider.Origin,
        flyCostMultiplier: 2.5f
    );
    
    pathfindingService.Initialize(config, heightProvider);
}
```

## Use Cases

| Scenario | Implementation Approach |
|----------|------------------------|
| **Unity Terrain** | Use built-in `TerrainHeightProvider` |
| **Procedural terrain** | Sample from noise function (see example above) |
| **Heightmap texture** | Read pixel values from Texture2D |
| **Mesh terrain** | Raycast down or read vertex heights |
| **Voxel world** | Query voxel data for surface height |
| **Flat plane** | Return constant height value |
| **Water surface** | Return water level, optionally with waves |

## See Also

- [Grid System](../core-concepts/grid-system) — How the pathfinding grid works
- [PathfindingService](./pathfinding-service) — How to initialize pathfinding with a height provider