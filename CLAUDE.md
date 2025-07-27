# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Product Process Tracking System** - a fully implemented web application built with React and TypeScript. The system tracks products through manufacturing stations with customizable routes, progress monitoring, analytics reporting, and comprehensive product management.

## ✅ Implementation Status

**COMPLETED**: Full web GUI implementation with modern React/TypeScript stack.

### 🚀 Live Application
- **Development Server**: `npm run dev` (runs on http://localhost:5173)
- **Production Build**: `npm run build`
- **Preview**: `npm run preview`
- **Open Browser (Windows)**: `start http://localhost:5173`

## Architecture

### Core Components Structure
- **ProductCard**: Modern card design with progress tracking, status badges, and current station info
- **RouteProgress**: Interactive step-by-step visualization of manufacturing stations
- **Dashboard**: Responsive grid layout with search, filtering, statistics, and product management
- **ProductDetail**: Comprehensive view of product journey with station history timeline
- **Analytics**: Advanced reporting dashboard with performance metrics and insights
- **AddProductForm**: Modal form for creating new products with route selection and validation

### Key Data Models
```typescript
Product: {
  id: string;
  name: string;
  model: string;
  currentStation: string;
  progress: number;
  status: "overdue" | "normal";
  route: Route;
  stationHistory: StationHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

Route: {
  id: string;
  name: string;
  description: string;
  stations: Station[];
}

Station: {
  id: string;
  name: string;
  owner: string;
  completionRule: "all_filled" | "custom";
  fields: Field[];
  estimatedDuration: number;
}

StationHistoryEntry: {
  id: string;
  stationId: string;
  stationName: string;
  owner: string;
  startTime: Date;
  endTime?: Date;
  status: "pending" | "in_progress" | "completed" | "skipped";
  formData: Record<string, any>;
  notes?: string;
}
```

### Application Flow
1. **Dashboard**: Main interface showing all products with statistics, search, and filtering
2. **Add Product**: Modal form for creating new products with route selection and validation
3. **Product Details**: Detailed view with station history, timeline, and current status
4. **Analytics**: Comprehensive reporting with performance metrics and visualizations
5. **Navigation**: Seamless transitions between all views with state management

### UI Framework & Stack
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern styling with responsive design
- **Custom UI Components**: Card, Badge, Progress, Button, Input, Select, Textarea
- **Lucide React** for consistent iconography
- **Vite** for fast development and building
- **English Interface** with professional manufacturing terminology

### ✨ Implemented Features

#### 📊 Dashboard
- Product grid with search and filtering
- Real-time statistics (total, normal, overdue, in-progress)
- Add new product functionality
- Direct access to analytics

#### 📈 Analytics Dashboard
- Key performance metrics (completion rates, average progress, duration)
- Station utilization analysis with visual charts
- Route usage distribution
- Owner performance tracking
- Status overview with color-coded indicators

#### ➕ Product Management
- **Add Product Form**: 
  - Validation for required fields
  - Route selection with live preview
  - Status assignment
  - Notes and metadata
- **Product Details**: Complete tracking information with station history
- **Status Tracking**: Visual progress indicators and timeline

#### 🎨 Modern UI/UX
- Responsive design for desktop and tablet use
- Professional color scheme with accessibility
- Smooth transitions and hover effects
- Modal overlays for forms
- Loading states and error handling

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Git Workflow (Windows)

**Current Branch**: `dev` (development branch)
**Main Branch**: `master` (for pull requests)

### After Any Enhancement
1. **Commit Changes**: Create descriptive commit messages
2. **Push to Dev**: Push changes to remote dev branch
3. **Create PR**: Create pull request from dev to master

### Commands
```cmd
# Check current status
git status

# Add and commit changes
git add .
git commit -m "feat: descriptive commit message"

# Push to remote dev branch
git push origin dev

# Create pull request (using GitHub CLI)
gh pr create --title "Feature: Description" --body "Enhancement details" --base master --head dev
```

**Note**: Always work on `dev` branch, create commits after enhancements, and submit PRs to `master`.

### Quick Start (Windows)
```cmd
# Install dependencies
npm install

# Stop any running development server (if needed)
# Use Ctrl+C in the terminal running the server, or:
# taskkill /f /im node.exe (kills all Node processes - use with caution)

# Start development server
npm run dev

# Open browser (in new terminal/command prompt)
# Note: Port may vary (5173, 5174, 5175, etc.) if default port is in use
start http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server Management
```cmd
# Start development server
npm run dev

# Stop development server
# Method 1: Press Ctrl+C in the terminal where server is running
# Method 2: Close the terminal window
# Method 3: Kill all Node processes (use carefully)
taskkill /f /im node.exe

# Check if port is in use
netstat -ano | findstr :5173

# Kill specific process by PID (if needed)
taskkill /f /PID <process_id>
```

### Available Scripts (Windows)
- `npm run dev`: Start development server with hot reload (auto-detects available port)
- `npm run build`: Create production build
- `npm run lint`: Run ESLint for code quality
- `npm run preview`: Preview production build locally
- `start http://localhost:5173`: Open application in default browser (adjust port as needed)

## File Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, etc.)
│   ├── ProductCard.tsx # Product display component
│   ├── RouteProgress.tsx # Station progress visualization
│   └── AddProductForm.tsx # Product creation form
├── pages/              # Application pages
│   ├── Dashboard.tsx   # Main dashboard
│   ├── ProductDetail.tsx # Product details view
│   └── Analytics.tsx   # Analytics dashboard
├── services/           # Data and API services
│   └── mockData.ts     # Mock data for development
├── types/              # TypeScript type definitions
│   └── index.ts        # Core data models
├── lib/                # Utility functions
│   └── utils.ts        # Helper functions
└── App.tsx            # Main application component
```

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (responsive design)

## Production Notes
- Optimized bundle size with Vite
- Tree-shaking enabled for minimal footprint
- Production builds include source maps for debugging
- ESLint configuration for code quality
- TypeScript strict mode enabled

## Future Enhancements
- Real-time WebSocket updates
- Export functionality (PDF/Excel reports)
- User authentication and role-based access
- Advanced filtering and sorting options
- Print-friendly layouts for manufacturing floor

---

**Status**: ✅ **PRODUCTION READY** - Full implementation with modern web technologies suitable for manufacturing environments.