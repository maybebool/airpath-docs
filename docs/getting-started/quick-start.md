---
sidebar_position: 3
---

# Quick Start
Explore the Demo scenes and get familiar with the core setup of Air Path.

## Try the Demo Scene first
AirPath includes demo scenes to help you understand the system:

### Mouse Click Mode

1. Navigate to `Assets/PlatypusIdeas/AirPath/Samples/Demo/Scenes/`
2. Open the demo scene based on your render pipeline
3. Press **Play**
4. Click on the terrain to set a start point
5. Click again to set an end point and calculate a path
6. Every additional click on the terrain now will be set as the new end point, while the current average position of the birds will be set as the new start point.

<img src={require('@site/static/img/ClickVersion.jpg').default} alt="How AirPath Works - Architecture Overview" width="500" />


### Switch to Target Follow Mode

1. Navigate to the `PathfindingManager > PathfindingCore` gameobject in the scene hierarchy.
<a href={require('@site/static/img/TargetFollowInsp.jpg').default} target="_blank">
  <img src={require('@site/static/img/TargetFollowInsp.jpg').default} alt="Target Follow Inspector" width="500" />
</a>
2. Change Starting Mode to Target Follow
3. Press **Play**
4. Watch the Target moving around the terrain, while the pathfinding system is updating the optimal path. 


<img src={require('@site/static/img/TargetFollowDemo.jpg').default} alt="How AirPath Works - Architecture Overview" width="500" />


## Understanding Path Calculation Settings

The **Pathfinding Configuration** ScriptableObject controls how paths are calculated, particularly how the algorithm weighs vertical movement against horizontal travel.
<a href={require('@site/static/img/PathfindingConfig.png').default} target="_blank">
  <img src={require('@site/static/img/PathfindingConfig.png').default} alt="Target Follow Inspector" width="500" />
</a>

<a href={require('@site/static/img/PathfindingConfigInspector.png').default} target="_blank">
  <img src={require('@site/static/img/PathfindingConfigInspector.png').default} alt="Target Follow Inspector" width="500" />
</a>

### Height Cost Model

These three parameters work together to determine how "expensive" vertical movement is compared to flying horizontally:

**Fly Cost Multiplier** (0 - 10, default: 1)  
Controls how much height changes cost relative to horizontal distance.
- **0** = Height is ignored entirely — paths take the shortest route regardless of elevation
- **1** = Climbing 1 meter costs the same as flying 1 meter horizontally
- **2** = Climbing 1 meter costs as much as flying 2 meters horizontally

Higher values make the algorithm prefer flatter routes, even if they're longer.

**Climb Weight** (0 - 3, default: 1.0)  
Additional multiplier applied specifically to upward movement. Increase this to make your agents avoid climbing more aggressively. A value of 2.0 means ascending is twice as costly as the base fly cost would suggest.

**Descent Weight** (0 - 2, default: 0.3)  
Multiplier applied to downward movement. This is typically lower than climb weight since descending requires less energy. The default of 0.3 means going down is only 30% as costly as going up.

:::tip Practical Example
With default settings (fly cost: 1, climb: 1.0, descent: 0.3), a bird flying over a 50m hill would prefer to go around it if the detour is less than roughly 65m longer — because climbing 50m "costs" 50 units, but descending only costs 15 units (50 × 0.3).
:::


## Visual Debug Settings
The ScriptableObject for Debug Visualization can be customized. Turn on/off the debug features you like. 
<a href={require('@site/static/img/VisualizationConfig.png').default} target="_blank">
  <img src={require('@site/static/img/VisualizationConfig.png').default} alt="Target Follow Inspector" width="500" />
</a>

<a href={require('@site/static/img/Wheatmap.jpg').default} target="_blank">
  <img src={require('@site/static/img/Wheatmap.jpg').default} alt="Target Follow Inspector" width="500" />
</a>


## Changing the shader colors
If you need or want to change the colors or intersection heights of the debug shader, you can do that on the material itself. Make sure you're making the changes on the right material based on your render pipeline.

<a href={require('@site/static/img/ShaderPlay.png').default} target="_blank">
  <img src={require('@site/static/img/ShaderPlay.png').default} alt="Target Follow Inspector" width="500" />
</a>

You can create whatever color and intersection levels fits your custom terrain best. Some impressions:

<a href={require('@site/static/img/HeightMap2.jpg').default} target="_blank">
  <img src={require('@site/static/img/HeightMap2.jpg').default} alt="Target Follow Inspector" width="500" />
</a>

<a href={require('@site/static/img/HeightMap3.jpg').default} target="_blank">
  <img src={require('@site/static/img/HeightMap3.jpg').default} alt="Target Follow Inspector" width="500" />
</a>


## What's Next?

Keep exploring the demo scenes for an even better understanding. Or, move on to the **[Setup Guide](../category/setup-guide/)** section where all the core components are explained for your own setup.


