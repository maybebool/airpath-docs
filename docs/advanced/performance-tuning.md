---
sidebar_position: 1
---

# Performance Tuning

This guide covers how to optimize AirPath for your specific use case, whether you're targeting mobile devices, need real-time pathfinding for many agents, or require high-precision paths.

## Grid Resolution

The most impactful setting is **Samples Per Dimension** in `PathfindingConfiguration`. This controls how many cells the pathfinding grid has.

```
Total Cells = SamplesPerDimension × SamplesPerDimension
```

| Samples | Total Cells | Memory | Speed | Accuracy |
|---------|-------------|--------|-------|----------|
| 32 | 1,024 | ~12 KB | Fastest | Low |
| 64 | 4,096 | ~48 KB | Fast | Medium |
| 128 | 16,384 | ~192 KB | Medium | High |
| 256 | 65,536 | ~768 KB | Slow | Very High |

### When to Increase Resolution

- Paths look jagged or cut corners
- Agents clip through small terrain features
- You need precise navigation around obstacles

### When to Decrease Resolution

- Pathfinding takes too long (>10ms)
- Targeting mobile or low-end hardware
- Your terrain is mostly flat with few obstacles
- You have many agents requesting paths frequently

### Finding the Right Balance

Start with 64×64 and adjust based on testing:

```csharp
// In PathfindingConfiguration
SamplesPerDimension = 64;  // Start here

// Test path quality, then adjust:
// - Paths jagged? Try 128
// - Too slow? Try 32
```

## Burst Compilation

AirPath's A* algorithm is Burst-compiled with aggressive optimizations:

```csharp
[BurstCompile(
    FloatMode = FloatMode.Fast,
    FloatPrecision = FloatPrecision.Standard,
    OptimizeFor = OptimizeFor.Performance
)]
```

### Verifying Burst is Active

1. Open **Jobs → Burst → Open Inspector**
2. Look for `AStarPathfindingJob` in the list
3. It should show as compiled (green checkmark)

### If Burst Isn't Working

- Ensure Burst package is installed: `com.unity.burst`
- Check for compilation errors in the Console
- Burst doesn't work in some debug configurations

### Burst Settings

In **Edit → Project Settings → Burst AOT Settings**:

- **Enable Optimizations**: On
- **Force Synchronous Compilation**: Off (except for debugging)

## Height Caching

`TerrainHeightProvider` can cache sampled heights to avoid re-reading terrain data.

```csharp
// In TerrainHeightProvider
[SerializeField] private bool cacheHeights = true;
```

### When to Enable (Default)

- Terrain doesn't change at runtime
- You want fastest pathfinding initialization

### When to Disable

- Terrain is modified during gameplay
- Using runtime terrain deformation
- Memory is extremely constrained

### Manual Cache Control

```csharp
// Force re-sample after terrain modification
heightProvider.InvalidateCache();
heightProvider.ResampleNow();
```

## Target Follow Throttling

When using `TargetFollow` mode, AirPath intelligently limits recalculation frequency. Configure these in `PathfindingConfiguration`:

| Setting | Default | Description |
|---------|---------|-------------|
| Min Recalculation Interval | 0.5s | Minimum time between recalculations |
| Target Move Threshold | 2 | Grid cells target must move to trigger recalc |
| Swarm Move Threshold | 3 | Grid cells swarm must move to trigger recalc |
| Use Distance Based Throttling | true | Reduce frequency for distant targets |
| Max Throttle Distance | 50 | Distance at which max throttling applies |
| Max Throttle Multiplier | 3 | Maximum interval multiplier |

### Aggressive Throttling (Better Performance)

```csharp
MinRecalculationInterval = 1.0f;      // Less frequent updates
TargetMoveThreshold = 5;              // Target must move more
UseDistanceBasedThrottling = true;
MaxThrottleMultiplier = 5f;           // Strong distance throttling
```

### Responsive Tracking (Better Accuracy)

```csharp
MinRecalculationInterval = 0.2f;      // More frequent updates
TargetMoveThreshold = 1;              // React to small movements
UseDistanceBasedThrottling = false;   // Consistent update rate
```

## Memory Optimization

### Pre-allocated Arrays

AirPath pre-allocates NativeArrays during initialization:

- `PathNodeComponent[]` — One per grid cell
- `PathNodeCost[]` — One per grid cell
- `TerrainHeights[]` — One per grid cell
- `ResultPath` — Reused list for path results
- `OpenList` — Reused list for A* open set

These are reused across path calculations, avoiding GC allocation during gameplay.

### Memory Footprint

Approximate memory per grid cell: ~12 bytes

| Grid Size | Approximate Memory |
|-----------|-------------------|
| 32×32 | ~12 KB |
| 64×64 | ~48 KB |
| 128×128 | ~192 KB |
| 256×256 | ~768 KB |

### Reducing Memory

1. Lower `SamplesPerDimension`
2. Dispose of `PathfindingService` when not needed
3. Avoid multiple PathfindingService instances

## Profiling

### Unity Profiler

1. Open **Window → Analysis → Profiler**
2. Enable **CPU Usage** module
3. Look for:
   - `AStarPathfindingJob` — The actual pathfinding
   - `PathfindingService.CalculatePath` — Total path request time
   - `JobHandle.Complete` — Time waiting for job

### Console Logging

AirPath logs timing information:

```
[PathfindingService] Path found: 45 waypoints in 2ms
```

### Custom Timing

```csharp
var stopwatch = System.Diagnostics.Stopwatch.StartNew();

var path = pathfindingService.CalculatePath(start, end, heightOffset);

stopwatch.Stop();
Debug.Log($"Path calculation: {stopwatch.ElapsedMilliseconds}ms");
```

### Performance Targets

| Platform | Target Time | Recommended Grid |
|----------|-------------|------------------|
| Mobile | Under 5ms | 32×32 or 64×64 |
| Desktop | Under 10ms | 64×64 or 128×128 |
| High-end | Under 20ms | 128×128 or 256×256 |

## Recommended Presets

### Mobile / Low-End

```csharp
// PathfindingConfiguration
SamplesPerDimension = 32;
FlyCostMultiplier = 2.5f;

// Target Follow (if used)
MinRecalculationInterval = 1.0f;
UseDistanceBasedThrottling = true;
MaxThrottleMultiplier = 5f;

// TerrainHeightProvider
cacheHeights = true;
```

### Desktop / Standard

```csharp
// PathfindingConfiguration
SamplesPerDimension = 64;
FlyCostMultiplier = 2.5f;

// Target Follow (if used)
MinRecalculationInterval = 0.5f;
UseDistanceBasedThrottling = true;
MaxThrottleMultiplier = 3f;

// TerrainHeightProvider
cacheHeights = true;
```

### High Precision

```csharp
// PathfindingConfiguration
SamplesPerDimension = 128;
FlyCostMultiplier = 2.5f;

// Target Follow (if used)
MinRecalculationInterval = 0.3f;
UseDistanceBasedThrottling = false;

// TerrainHeightProvider
cacheHeights = true;
```

## Common Performance Issues

### Pathfinding Takes Too Long

1. **Reduce grid resolution** — Most impactful change
2. **Check Burst compilation** — Ensure job is compiled
3. **Avoid very long paths** — Break into segments if needed

### Frame Hitches

1. **Use Target Follow throttling** — Don't recalculate every frame
2. **Spread requests over frames** — Don't request 10 paths at once
3. **Check for GC allocation** — Use Profiler to verify no allocations

### High Memory Usage

1. **Reduce grid resolution** — Biggest memory saver
2. **Single PathfindingService** — Don't create multiple instances
3. **Dispose when not needed** — Clean up on scene transitions

### Path Quality Issues

These aren't performance problems, but users often trade quality for speed:

- **Jagged paths** — Increase grid resolution
- **Paths through terrain** — Increase `FlyCostMultiplier`
- **Paths over mountains** — Increase `FlyCostMultiplier`

## See Also

- [Grid System](../core-concepts/grid-system) — Understanding resolution trade-offs
- [Pathfinding Algorithm](../core-concepts/pathfinding-algorithm) — Cost model details
- [Configuration System](../core-concepts/configuration-system) — Managing presets