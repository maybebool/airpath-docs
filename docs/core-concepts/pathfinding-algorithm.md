---
sidebar_position: 4
---

# Pathfinding Algorithm

AirPath uses a height-aware A* algorithm optimized for aerial navigation. This page explains how the algorithm works and how it calculates path costs.

## A* Overview

A* is a best-first search algorithm that finds the shortest path between two points. It uses two values for each cell:

- **G Cost** — Actual cost to reach this cell from the start
- **H Cost** — Estimated cost to reach the end (heuristic)
- **F Cost** — Total cost (G + H)

The algorithm always explores the cell with the lowest F cost next, guaranteeing an optimal path.

## Height-Aware Cost Model

Standard A* only considers distance. AirPath adds height-based costs to create natural flight paths that prefer valleys over mountains.

### Cost Formula

```
Total G Cost = Previous G + Movement Cost + Fly Cost

Where Fly Cost = Altitude Cost + Climb Cost + Slope Penalty
```

### Cost Components

#### 1. Movement Cost (Distance)

Base cost for moving between cells.

```
Cardinal (N/S/E/W):  1.0 × CellSize
Diagonal:           1.414 × CellSize  (√2)
```

#### 2. Altitude Cost

Penalizes being at high elevations. Makes paths prefer lower terrain.

```
Altitude Cost = Height × FlyCostMultiplier × 0.01
```

**Effect:** A cell at height 100 with multiplier 2.5 adds `100 × 2.5 × 0.01 = 2.5` to the cost.

#### 3. Climb Cost

Extra penalty for gaining altitude. Only applies when moving uphill.

```
If going uphill (heightDiff > 0):
    Climb Cost = HeightDifference × FlyCostMultiplier × 0.5

If going downhill or level:
    Climb Cost = 0
```

**Effect:** Climbing 10 units with multiplier 2.5 adds `10 × 2.5 × 0.5 = 12.5` to the cost.

#### 4. Slope Penalty

Penalizes rapid height changes in either direction. Smooths paths and avoids cliff edges.

```
Slope Penalty = |HeightDifference| × FlyCostMultiplier × 0.1
```

**Effect:** A 10-unit height change (up or down) with multiplier 2.5 adds `10 × 2.5 × 0.1 = 2.5` to the cost.

### Complete Example

Moving from a cell at height 50 to a neighbor at height 65 (cardinal direction):

```
Movement Cost:  1.0 × 15.625 (cell size)     = 15.625
Altitude Cost:  65 × 2.5 × 0.01              =  1.625
Climb Cost:     15 × 2.5 × 0.5               = 18.75
Slope Penalty:  15 × 2.5 × 0.1               =  3.75
                                              ───────
Total Cost:                                   39.75
```

Compare to moving to a cell at height 50 (same level):

```
Movement Cost:  1.0 × 15.625                 = 15.625
Altitude Cost:  50 × 2.5 × 0.01              =  1.25
Climb Cost:     0 (no climb)                 =  0
Slope Penalty:  0 (no height change)         =  0
                                              ───────
Total Cost:                                   16.875
```

The algorithm strongly prefers the level path.

## Heuristic Function

AirPath uses **Octile distance** — the optimal heuristic for 8-directional movement:

```
Octile Distance = max(dx, dy) + 0.414 × min(dx, dy)
```

Where `dx` and `dy` are the grid distances to the target.

This heuristic is:
- **Admissible** — Never overestimates, guaranteeing optimal paths
- **Consistent** — Ensures efficient search without revisiting nodes

## Diagonal Movement

The algorithm supports 8-directional movement with corner-cutting prevention:

<img src={require('@site/static/img/diagonal-movement.png').default} alt="How AirPath Works - Architecture Overview" width="500" />

A diagonal move is only allowed if at least one adjacent cardinal cell is walkable.

## FlyCostMultiplier

The **Fly Cost Multiplier** in `PathfindingConfiguration` scales all height-based costs:

| Value | Effect |
|-------|--------|
| 0.5 | Weak height avoidance — paths may cross mountains |
| 2.5 | Default — balanced height consideration |
| 5.0 | Strong height avoidance — paths strongly prefer valleys |
| 10.0 | Very strong — almost always takes lowest route |

**Tuning tip:** Increase if paths cross terrain you'd expect them to avoid. Decrease if paths take unnecessarily long detours.

## Performance Optimizations

The A* job is heavily optimized:

### Burst Compilation

```csharp
[BurstCompile(
    FloatMode = FloatMode.Fast,
    FloatPrecision = FloatPrecision.Standard,
    OptimizeFor = OptimizeFor.Performance
)]
```

- Compiles to native code
- SIMD vectorization where possible
- No garbage collection

### Memory Layout

- Flat arrays indexed by `y × width + x`
- Cache-friendly access patterns
- Pre-allocated NativeArrays (no allocation during pathfinding)

### Algorithm Efficiency

- Early exit when destination reached
- Processed nodes never revisited
- Maximum iteration limit prevents infinite loops

## Path Result

The algorithm returns grid indices, which `PathfindingService` converts to world positions:

```
Grid Path:    [0] → [15] → [30] → [45] → [60]
                     ↓
World Path:   [(10, 5, 20), (25, 8, 35), (40, 12, 50), ...]
```

Each world position includes:
- X/Z from grid cell center
- Y from terrain height + height offset

## Walkability

All cells are walkable by default. The system checks `IsWalkable` but currently doesn't provide a way to mark cells as blocked. Future versions may add obstacle support.

## Algorithm Visualization

<img src={require('@site/static/img/algorithm-visualization.png').default} alt="How AirPath Works - Architecture Overview" width="600" />

## See Also

- [Grid System](./grid-system) — How the pathfinding grid works
- [PathfindingService](../api-reference/pathfinding-service) — API for path calculation
- [Performance Tuning](../advanced/performance-tuning) — Optimizing pathfinding