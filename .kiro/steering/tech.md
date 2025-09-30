# Technology Stack

## Frontend
- **HTML5**: Semantic markup with modern web standards
- **CSS3**: Custom styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No framework dependencies, modular ES6+ code
- **External Libraries**:
  - Three.js (r128) - 3D visualizations and hero animations
  - Chart.js (3.9.1) - Data visualization and charts

## Architecture
- **Multi-Page Application**: Separate pages for home and dashboard
- **Modular JavaScript**: Separate files for different features
- **Component-based**: Reusable HTML components
- **Real-time Updates**: Animation frames for live data visualization
- **Authentication Flow**: Home page → Login/Register → Dashboard redirect

## File Organization
```
assets/
├── css/           # Stylesheets
├── js/            # JavaScript modules
│   ├── ml/        # Machine learning related code
│   └── *.js       # Feature-specific modules
├── data/          # Mock data and samples
└── models/        # ML model files
```

## Key JavaScript Modules
- `home.js` - Home page functionality and navigation
- `dashboard.js` - Dashboard functionality and user interface
- `auth.js` - Authentication system with page redirects
- `charts.js` - Chart.js integration
- `3d-viz.js` - Three.js visualizations
- `ml-interface.js` - ML model integration
- `pressure-grid.js` - Sensor data visualization

## Development Workflow
- **No Build System**: Direct file serving, no compilation needed
- **CDN Dependencies**: External libraries loaded via CDN
- **Live Development**: Direct file editing with browser refresh
- **Modular Loading**: Script tags in dependency order

## Browser Support
- Modern browsers with ES6+ support
- WebGL support required for 3D visualizations
- Canvas API for charts and heatmaps