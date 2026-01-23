# Interactive Explanation Feeds

This document describes the enhanced interactive feed system for the "Explain It Like I'm Five... Badly" application.

## Overview

The interactive feed system provides an engaging, responsive user interface for browsing, filtering, and interacting with user-submitted explanations. The enhancements focus on improving discoverability, user engagement, and overall visual polish.

## Components

### FeedHeader Component

**Location:** `src/components/FeedHeader.tsx`

The FeedHeader displays community stats, trending topics, search functionality, and view mode controls.

#### Features

1. **Animated Stats Display**
   - Total explanation count with animated counter
   - Total community votes
   - Numbers animate on load for visual engagement

2. **Trending Topics**
   - Shows top 3 trending topics based on recency and votes
   - Click on a topic to filter the feed
   - Fire icon indicates trending content

3. **Search Functionality**
   - Real-time search across topics and content
   - Clear button for quick reset
   - Focus state with visual feedback

4. **View Mode Toggle**
   - **Comfortable:** Full card display with all details
   - **Compact:** Condensed view for faster scanning

#### Props

```typescript
interface FeedHeaderProps {
  stats: {
    totalExplanations: number;
    totalVotes: number;
    hotTopics: string[];
  };
  viewMode: "comfortable" | "compact";
  onViewModeChange: (mode: "comfortable" | "compact") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```

### Enhanced ExplanationCard

**Location:** `src/components/ExplanationCard.tsx`

The ExplanationCard now supports compact view mode and includes share functionality.

#### New Features

1. **Share Menu**
   - Copy explanation text to clipboard
   - Share to X (Twitter)
   - Dropdown menu with smooth animations

2. **View Mode Support**
   - Responsive to `viewMode` prop
   - Compact mode hides "Did this help?" section
   - Reduced padding and smaller text in compact mode

3. **Toast Notifications**
   - Shows confirmation when copying to clipboard
   - Error handling for clipboard operations

#### Props

```typescript
interface ExplanationCardProps {
  explanation: Explanation;
  index?: number;
  viewMode?: "comfortable" | "compact";
}
```

### Toast Notification System

**Location:** `src/components/Toast.tsx`

A lightweight toast notification system for user feedback.

#### Usage

```typescript
import { showToast } from "@/components/Toast";

// Show different types of toasts
showToast("Copied to clipboard!", "success");
showToast("Failed to copy", "error");
showToast("Welcome back!", "info");
showToast("You reached 100 votes!", "celebration");
```

#### Toast Types

| Type | Icon | Use Case |
|------|------|----------|
| `success` | Green checkmark | Successful actions |
| `error` | Red X | Failed operations |
| `info` | Blue info circle | General information |
| `celebration` | Party emoji | Achievements/milestones |

### ScrollToTop Button

**Location:** `src/components/ScrollToTop.tsx`

A floating button that appears when users scroll down, allowing quick return to the top.

#### Features

- Appears after scrolling 400px
- Smooth scroll animation
- Hover effect with arrow movement
- Purple themed to match site design

## Feed Enhancements

### Search and Filtering

The feed now supports:

1. **Text Search**
   - Searches across topic names and explanation content
   - Case-insensitive matching
   - Real-time results

2. **Combined Filtering**
   - Search can be combined with time filters
   - Clear indication of active filters
   - Quick reset buttons

### Trending Algorithm

Topics are ranked by a combination of:

```typescript
score = (upvotes - downvotes + 1) * (1 + recencyBonus)
```

Where `recencyBonus` gives higher weight to content from the last 48 hours.

## CSS Animations

**Location:** `src/app/globals.css`

New animations added:

| Animation | Description |
|-----------|-------------|
| `slideInToast` | Toast notification entry |
| `countUp` | Stats number animation |
| `glow` | Interactive element glow |
| `slideUp` | New item entry |
| `trendingPulse` | Trending badge pulse |

### Utility Classes

```css
.hover-lift        /* Subtle lift effect on hover */
.search-focus-glow /* Search input focus glow */
.trending-badge    /* Animated trending indicator */
.view-mode-transition /* Smooth view mode changes */
```

## Page Layout Improvements

The main page (`src/app/page.tsx`) includes:

1. **Enhanced Header**
   - Gradient text for title
   - Animated thinking emoji
   - Improved info box styling

2. **Section Improvements**
   - Icon integration
   - Better visual hierarchy
   - Two-column layout for guidelines (on larger screens)

3. **Footer Redesign**
   - Community values as styled badges
   - Emoji integration
   - Improved spacing

## Usage Examples

### Basic Feed Setup

```tsx
import Feed from "@/components/Feed";
import { ToastContainer } from "@/components/Toast";
import ScrollToTop from "@/components/ScrollToTop";

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <ToastContainer />
      <ScrollToTop />
      <Feed refreshKey={refreshKey} />
    </div>
  );
}
```

### Triggering Toasts

```tsx
import { showToast } from "@/components/Toast";

const handleAction = async () => {
  try {
    await someAction();
    showToast("Action completed!", "success");
  } catch (error) {
    showToast("Something went wrong", "error");
  }
};
```

## Accessibility

All new components maintain accessibility standards:

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Proper heading hierarchy
- Screen reader friendly

## Browser Support

The enhancements use modern CSS features:

- CSS Animations
- Flexbox and Grid
- CSS Custom Properties
- `backdrop-filter` (with fallbacks)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

1. **Lazy Animation Loading**
   - Intersection Observer triggers animations only when visible
   - Staggered delays prevent animation overload

2. **Efficient Re-renders**
   - Memoized callbacks with useCallback
   - Proper dependency arrays

3. **CSS-only Animations**
   - No JavaScript animation libraries
   - GPU-accelerated transforms
