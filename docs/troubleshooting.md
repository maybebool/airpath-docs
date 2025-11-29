---
sidebar_position: 100
---

# Troubleshooting

:::info Coming Soon
This section is under construction. Check back soon for comprehensive troubleshooting guidance.
:::

## Common Issues

### Compilation Errors After Import

**Problem**: Red errors in the console after importing AirPath.

**Solution**: Ensure all required packages are installed:
1. Open **Window → Package Manager**
2. Install missing packages: Entities, Burst, Collections, Mathematics

### EventBus Not Initialized

**Problem**: Error message "PathfindingEventBus instance not initialized"

**Solution**: 
1. Create an `EventBusUpdateHandler` GameObject in your scene
2. Assign the `PathfindingEventBus` ScriptableObject asset to it

### No Path Found

**Problem**: Path calculation returns null or empty.

**Solution**:
- Verify start/end positions are within terrain bounds
- Check console for boundary clamping warnings
- Ensure the height provider is properly initialized

### Poor Performance

**Problem**: Frame rate drops during pathfinding.

**Solution**:
- Reduce grid resolution (Samples Per Dimension)
- Ensure Burst compilation is enabled
- Use IL2CPP scripting backend for builds

## Getting Help

If you encounter issues not covered here:

1. Check the [Changelog](/blog) for known issues and fixes
2. Review the [API Reference](./category/api-reference) for correct usage
3. Contact support via info@platypus-ideas.com

{/* More troubleshooting content will be added */}
