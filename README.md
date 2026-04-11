# 🐉 Mini Dragon

**Interactive 3D dragon animation with realistic physics**

A web-based 3D dragon animation built with Three.js, featuring procedural animation, realistic physics, and interactive camera controls.

## Features

- 🐉 **Procedural Dragon**: Fully articulated dragon model with skeletal animation
- 🎮 **Interactive Controls**: Camera follows the dragon or free-roam mode
- ✨ **Two Rendering Modes**:
  - **Simple**: Basic geometry with solid colors
  - **Realistic**: Advanced materials with lighting and shadows
- 🎨 **Smooth Animations**: Wing flapping, tail movement, and natural flight patterns
- 📱 **Responsive**: Works on desktop and mobile devices

## Live Demo

Open `index.html` in a modern web browser to see the dragon in action.

## Controls

- **Simple/Realistic**: Toggle between rendering modes
- **📷 Follow/Free**: Switch camera between following the dragon and free-roam mode
- **Mouse**: In free mode, drag to rotate camera

## Technical Stack

- **Three.js**: 3D graphics library (v0.160.0)
- **Vanilla JavaScript**: No additional frameworks
- **Module System**: ES6 modules with importmap

## File Structure

```
miniDragon/
├── index.html           # Main HTML file with UI controls
├── dragon-v1.js         # Simple rendering mode
├── dragon-v2.js         # Realistic rendering mode with advanced materials
└── README.md
```

## How It Works

1. **Geometry**: Procedurally generated dragon mesh with segments for body, neck, tail, wings
2. **Animation**: Sine-wave based wing flapping and tail movement
3. **Physics**: Circular flight path with natural motion
4. **Rendering**: Two modes - simple (basic materials) and realistic (advanced lighting)

## Customization

You can modify:
- Dragon size and proportions
- Flight path and speed
- Wing flapping frequency
- Camera follow distance
- Colors and materials

## Browser Compatibility

Requires a modern browser with WebGL support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Open source project for educational and demonstration purposes.
