# SQL Query Runner Application

A modern web-based application for running SQL queries and displaying results in a user-friendly interface. This application provides a simulated SQL query environment with predefined queries and results for demonstration purposes.

## Overview

This application is built as a frontend-only solution that allows users to:
- Write and execute SQL queries using a code editor
- View query results in a tabular format
- Switch between predefined queries
- Toggle between light and dark themes
- Handle large datasets efficiently

## Technical Stack

### Framework
- **React** (v19.0.0) - Modern UI library for building user interfaces
- **Vite** (v6.2.0) - Next-generation frontend build tool

### Key Dependencies
- `react-ace` (v14.0.1) - Code editor component with SQL syntax highlighting
- `@tanstack/react-table` (v8.21.2) - Table component for displaying query results
- `react-window` (v1.8.11) - Virtualized list for efficient rendering of large datasets
- `styled-components` (v6.1.16) - CSS-in-JS styling solution
- `react-select` (v5.10.1) - Enhanced select component for query selection
- `papaparse` (v5.5.2) - Used for CSV export functionality in the results table

## Performance Metrics

### Load Time
- Initial page load: ~1.2s (measured using Chrome DevTools Performance tab)
- Time to interactive: ~1.5s
- First contentful paint: ~0.8s

### Performance Optimizations
1. **Code Splitting**
   - Implemented dynamic imports for the code editor component
   - Lazy loading of table components for large datasets

2. **Virtualization**
   - Used `react-window` for efficient rendering of large result sets
   - Implemented windowing to render only visible rows

3. **Bundle Optimization**
   - Tree-shaking enabled in Vite configuration
   - Minification of production builds
   - Optimized asset loading with proper caching headers

4. **Component Optimization**
   - Memoized expensive computations
   - Implemented proper React hooks usage
   - Optimized re-renders using `useMemo` and `useCallback`

## Features

### Core Features
- SQL query editor with syntax highlighting
- Query execution simulation
- Results display in tabular format
- Predefined query selection
- Clear query functionality

### Advanced Features
- Dark/Light theme toggle
- Responsive design for mobile devices
- Virtualized table for handling large datasets
- Query history
- Export results to CSV

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/RuntimeTerror6969/vigilant-octo-meme
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Testing Methodology
Load time and performance metrics were measured using:
- Chrome DevTools Performance tab
- Lighthouse CI
- Web Vitals API
- React DevTools Profiler

## Contributing
This is a demonstration project for the Atlan Frontend Internship Task 2025. While it's not open for contributions, feel free to fork and modify for your own learning purposes.

## License
MIT License
