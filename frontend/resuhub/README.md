# ResuHub Dashboard - Component Architecture

A professional, production-ready React dashboard for resume management with modular component architecture.

## 📁 Component Structure

```
components/
├── Dashboard.jsx          # Main container component
├── Navigation.jsx         # Top navigation bar with profile menu
├── WelcomeHeader.jsx      # Welcome section with greeting
├── StatCard.jsx           # Reusable stat/metric card
├── PerformanceChart.jsx   # Bell curve performance visualization
├── QuickActions.jsx       # Quick action buttons panel
├── RecentResumes.jsx      # Resume list container
├── ResumeCard.jsx         # Individual resume item card
└── index.js               # Component exports
```

## 🎯 Component Overview

### Dashboard (Main Container)
**File:** `Dashboard.jsx`  
**Purpose:** Orchestrates all dashboard components and manages global state

**Props:** None (root component)

**Features:**
- Manages animation state for staggered loading
- Calculates aggregate statistics
- Handles navigation state
- Provides mock data (replace with API calls)

**Usage:**
```jsx
import Dashboard from './components/Dashboard';

function App() {
  return <Dashboard />;
}
```

---

### Navigation
**File:** `Navigation.jsx`  
**Purpose:** Top navigation bar with logo, menu items, and profile dropdown

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `activeNav` | string | Yes | Currently active navigation item |
| `onNavChange` | function | Yes | Callback when navigation changes |

**Features:**
- Sticky positioning
- Profile dropdown menu
- Notification bell
- Smooth transitions
- Backdrop click-to-close

**Usage:**
```jsx
<Navigation 
  activeNav="dashboard" 
  onNavChange={(nav) => setActiveNav(nav)} 
/>
```

---

### WelcomeHeader
**File:** `WelcomeHeader.jsx`  
**Purpose:** Displays personalized greeting

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userName` | string | Yes | - | User's name |
| `greeting` | string | No | "Good afternoon" | Time-based greeting |
| `isLoaded` | boolean | No | true | Controls animation |

**Usage:**
```jsx
<WelcomeHeader 
  userName="John" 
  greeting="Good morning"
  isLoaded={true}
/>
```

---

### StatCard
**File:** `StatCard.jsx`  
**Purpose:** Reusable card component for displaying metrics

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | Component | Yes | Lucide icon component |
| `label` | string | Yes | Main label text |
| `subtitle` | string | Yes | Secondary description |
| `value` | number/string | Yes | Metric value |
| `badge` | string | Yes | Badge text (e.g., "AVG") |
| `trend` | string | No | Trend indicator (e.g., "+5%") |
| `suffix` | string | No | Value suffix (e.g., "docs") |
| `gradientFrom` | string | Yes | Start color: "indigo", "purple", "blue", "emerald" |
| `gradientTo` | string | Yes | End color |
| `delay` | number | No | Animation delay (ms) |
| `isLoaded` | boolean | No | Controls animation |
| `iconFill` | boolean | No | Fill icon (for solid icons) |

**Supported Color Schemes:**
- `indigo → purple` - Default, professional
- `purple → pink` - Accent, highlights
- `blue → cyan` - Information, data
- `emerald → teal` - Success, growth

**Usage:**
```jsx
import { TrendingUp } from 'lucide-react';

<StatCard
  icon={TrendingUp}
  label="Average Score"
  subtitle="Across all resumes"
  value={85}
  badge="AVG"
  trend="+5%"
  gradientFrom="indigo"
  gradientTo="purple"
  delay={100}
  isLoaded={true}
/>
```

---

### PerformanceChart
**File:** `PerformanceChart.jsx`  
**Purpose:** Displays ATS performance distribution with bell curve

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userScore` | number | Yes | User's average score (0-100) |
| `percentile` | number | No | Percentile ranking (default: 15) |
| `isLoaded` | boolean | No | Controls animation |
| `delay` | number | No | Animation delay (ms) |

**Features:**
- Animated SVG bell curve
- Dynamic user position calculation
- "Hire zone" highlighting
- Responsive design

**Usage:**
```jsx
<PerformanceChart 
  userScore={82} 
  percentile={15}
  isLoaded={true}
  delay={500}
/>
```

---

### QuickActions
**File:** `QuickActions.jsx`  
**Purpose:** Action button panel for common tasks

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isLoaded` | boolean | No | Controls animation |
| `delay` | number | No | Animation delay (ms) |
| `onUpload` | function | No | Upload button callback |
| `onReview` | function | No | AI review button callback |
| `onExport` | function | No | Export button callback |

**Usage:**
```jsx
<QuickActions
  isLoaded={true}
  delay={600}
  onUpload={() => console.log('Upload clicked')}
  onReview={() => console.log('Review clicked')}
  onExport={() => console.log('Export clicked')}
/>
```

---

### RecentResumes
**File:** `RecentResumes.jsx`  
**Purpose:** Container for resume card grid

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `resumes` | Array | Yes | Array of resume objects |
| `isLoaded` | boolean | No | Controls animation |
| `delay` | number | No | Animation delay (ms) |
| `onViewAll` | function | No | "View All" button callback |
| `onResumeClick` | function | No | Resume card click callback |

**Resume Object Shape:**
```javascript
{
  id: number,
  name: string,
  score: number,      // 0-100
  date: string,       // "YYYY-MM-DD"
  industry: string,
  views: number
}
```

**Usage:**
```jsx
<RecentResumes
  resumes={resumeArray}
  isLoaded={true}
  delay={700}
  onViewAll={() => navigate('/all-resumes')}
  onResumeClick={(resume) => navigate(`/resume/${resume.id}`)}
/>
```

---

### ResumeCard
**File:** `ResumeCard.jsx`  
**Purpose:** Individual resume item display

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `resume` | Object | Yes | Resume data object |
| `onClick` | function | No | Click handler |

**Features:**
- Color-coded score badges (green ≥85, yellow ≥75, red <75)
- Hover effects with scale transform
- Keyboard accessible (Enter/Space)
- Truncated text with tooltips

**Usage:**
```jsx
<ResumeCard 
  resume={{
    id: 1,
    name: 'Software_Engineer_Resume.pdf',
    score: 87,
    date: '2024-02-10',
    industry: 'Tech',
    views: 124
  }}
  onClick={() => handleResumeClick()}
/>
```

---

## 🎨 Design System

### Color Palette
- **Background:** Gradient from indigo-950 → slate-900 → indigo-900
- **Cards:** Slate-900/800 with glassmorphism
- **Primary Accent:** Indigo → Purple gradient
- **Success:** Emerald → Teal
- **Warning:** Amber → Orange
- **Error:** Red → Rose

### Typography
- **Font:** Inter (400-900 weights)
- **Headings:** 700-900 weight with gradient text
- **Body:** 400-600 weight

### Spacing
- **Card Padding:** p-7 to p-8
- **Grid Gaps:** gap-5 to gap-6
- **Section Margins:** mb-10

### Animations
- **Duration:** 300-700ms
- **Easing:** ease-out
- **Stagger Delay:** 100ms increments
- **Respects:** `prefers-reduced-motion`

---

## 🚀 Getting Started

### Installation
```bash
npm install lucide-react
```

### Basic Setup
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './components/Dashboard';
import './index.css'; // Tailwind CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
```

### With React Router
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Add other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 📦 Dependencies

```json
{
  "react": "^18.0.0",
  "lucide-react": "^0.263.1",
  "tailwindcss": "^3.0.0"
}
```

---

## ♿ Accessibility

All components follow WCAG 2.1 AA guidelines:
- ✅ Keyboard navigation support
- ✅ ARIA labels and roles
- ✅ Focus states visible
- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Respects `prefers-reduced-motion`
- ✅ Semantic HTML

---

## 🔧 Customization

### Changing Colors
Edit the color scheme in `StatCard.jsx`:

```jsx
const colorMap = {
  yourTheme: {
    from: 'from-your-color',
    to: 'to-your-color',
    // ... other properties
  }
};
```

### Adding New Stats
Add to the `statsConfig` array in `Dashboard.jsx`:

```jsx
{
  id: 'custom-stat',
  icon: YourIcon,
  label: 'Your Metric',
  subtitle: 'Description',
  value: 100,
  badge: 'CUSTOM',
  gradientFrom: 'indigo',
  gradientTo: 'purple',
  delay: 500
}
```

### Custom Actions
Edit the `actions` array in `QuickActions.jsx`:

```jsx
{
  id: 'custom-action',
  icon: YourIcon,
  label: 'Custom Action',
  subtitle: 'Description',
  variant: 'secondary',
  color: 'blue',
  onClick: yourCallback
}
```

---

## 📝 Production Checklist

- [ ] Replace mock data with API calls
- [ ] Add error boundaries
- [ ] Implement loading states
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add PropTypes or TypeScript
- [ ] Optimize bundle size
- [ ] Add analytics tracking
- [ ] Implement error logging
- [ ] Add performance monitoring
- [ ] Test on multiple browsers/devices

---

## 🎯 Next Steps

1. **API Integration:** Replace `mockResumes` with real API calls
2. **State Management:** Add Redux/Zustand for global state
3. **Routing:** Implement React Router for navigation
4. **Forms:** Add resume upload functionality
5. **Testing:** Write comprehensive unit/integration tests
6. **Documentation:** Add JSDoc comments for all props
7. **TypeScript:** Convert to TypeScript for type safety

---

## 📄 License

MIT License - Feel free to use in your projects!

---

## 🤝 Contributing

1. Keep components small and focused
2. Follow existing naming conventions
3. Add PropTypes/TypeScript definitions
4. Include accessibility features
5. Test responsiveness
6. Document all props

---

Built with ❤️ using React, Tailwind CSS, and Lucide Icons