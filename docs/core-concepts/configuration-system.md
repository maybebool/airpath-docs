---
sidebar_position: 5
---

# Configuration System

AirPath uses ScriptableObject assets for all configuration. This page explains why and how to work with them.

## Why ScriptableObjects?

**Scene-independent** — Settings live in assets, not scenes. Change a config once, all scenes using it update.

**Swappable** — Drag a different asset to switch presets instantly (editor or runtime).

**Version control friendly** — Asset files diff cleanly, no scene file churn.

**No runtime allocation** — ScriptableObjects are loaded once, no GC pressure.

## Configuration Assets

| Asset | Menu Path | Purpose |
|-------|-----------|---------|
| PathfindingConfiguration | Create → Pathfinding → Configurations → Pathfinding Configuration | Grid size, cost multipliers, boundary handling |
| VisualizationConfiguration | Create → Pathfinding → Configurations → Visualization Configuration | Path line, cell colors, debug display |
| PathfindingEventBus | Create → EventSystem → PathfindingEventBus | Event system settings |

## Creating Configurations

Right-click in Project window → select the menu path from the table above.

Name your assets descriptively:
- `PathfindingConfig_Default`
- `PathfindingConfig_HighResolution`
- `VisualizationConfig_Debug`

## Swapping at Runtime

Configurations can be changed during play:

```csharp
// Example: Switch to high-resolution config
[SerializeField] private PathfindingConfiguration highResConfig;

public void SwitchToHighRes()
{
    // Assign new config and reinitialize
    // Implementation depends on your setup
}
```

When a configuration changes, `ConfigurationChangedEvent` is published. Systems can subscribe and respond:

```csharp
this.Subscribe<ConfigurationChangedEvent>(evt =>
{
    if (evt.RequiresRecalculation)
    {
        // Grid settings changed, reinitialize
    }
});
```

## Detailed Documentation

For field-by-field documentation:

- **PathfindingConfiguration** — See [Custom Minimal Setup](../setup-guide/terrain-setup) and [Pathfinding Manager](../setup-guide/pathfinding-manager)
- **PathfindingEventBus** — See [Events](../api-reference/events)