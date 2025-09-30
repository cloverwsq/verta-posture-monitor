# Project Structure

## Root Level
- `index.html` - Home/landing page with marketing content
- `dashboard.html` - User dashboard (requires authentication)
- `home.html` - Backup copy of home page
- `package.json` - Project metadata (currently empty)
- `README.md` - Project documentation (currently empty)

## Core Directories

### `/assets/` - Static Resources
- `css/` - Stylesheets and visual themes
- `js/` - JavaScript modules organized by feature
  - `ml/` - Machine learning integration code
- `data/` - Mock data, samples, and test datasets
  - `samples/` - Sample sensor data files
- `models/` - ML model files and configurations
  - `production/` - Production-ready models

### `/components/` - Reusable HTML Components
- `dashboard.html` - Dashboard component (empty)
- `pressure-grid.html` - Pressure sensor visualization component

### `/tools/` - Development and Testing Tools
- `data-collector.html` - Data collection interface (empty)
- `model-tester.html` - ML model testing tool (empty)
- `sensor-calibration.html` - Sensor calibration utility (empty)

### `/docs/` - Documentation
- `api-reference.md` - API documentation (empty)
- `data-format.md` - Data structure specifications (empty)
- `ml-integration.md` - ML integration guide (empty)

## Code Organization Patterns

### JavaScript Modules
- Each feature has its own JS file (auth, charts, 3d-viz, etc.)
- Global functions exposed via `window` object
- Page-specific initialization: `home.js` for landing, `dashboard.js` for app
- Event-driven architecture with custom events
- Authentication flow handles page redirects automatically

### HTML Components
- Reusable components in `/components/` directory
- Components are JavaScript files that generate HTML
- Self-contained with their own styling and logic

### CSS Architecture
- Single main stylesheet (`assets/css/style.css`)
- Component-specific styles included inline or in main CSS
- CSS Grid and Flexbox for layouts
- CSS custom properties for theming

### Data Flow
- Mock data in `assets/data/mock-data.js`
- Real-time updates via `requestAnimationFrame`
- Global `vertaApp` object for state management
- Event-based communication between modules
- User authentication state stored in localStorage
- Page-specific authentication checks on load

### Page Structure
- **Home Page (`index.html`)**: Marketing content, authentication modals
- **Dashboard Page (`dashboard.html`)**: User interface, real-time data, charts
- **Authentication Flow**: Home → Login/Register → Dashboard redirect
- **Protected Routes**: Dashboard requires valid authentication token