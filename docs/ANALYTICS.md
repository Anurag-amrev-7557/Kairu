# Analytics Dashboard Documentation

## Overview

The Analytics Dashboard provides comprehensive insights into focus patterns, productivity trends, and habit tracking. It features four distinct views: Today, Day, Week, and Year, each offering unique perspectives on your focus data.

## Features

### 1. Today's Focus View

The Today view provides a real-time snapshot of your current day's productivity.

**Components:**
- **Stats Overview Cards**
  - Today's Focus Time
  - Sessions Completed
  - Current Streak
  - Lifetime Focus

- **Daily Timeline**
  - 24-hour visualization
  - Focus sessions plotted by hour
  - Visual representation of breaks
  - Hover to see session details

- **Focus by Task**
  - Top 5 tasks by focus time
  - Progress bars showing relative time
  - Session count per task

- **Lifetime Statistics**
  - Total focus time accumulated
  - Total sessions completed
  - Total focus days

**Features:**
- Real-time updates as you complete sessions
- Color-coded session types (Focus vs Break)
- Interactive hover states for detailed information

### 2. Day View

The Day view allows you to analyze any specific day in detail.

**Components:**
- **Date Navigator**
  - Previous/Next day buttons
  - Current date display
  - Quick stats summary

- **Daily Statistics**
  - Total focus time for the day
  - Number of focus sessions
  - Average session duration

- **Detailed Timeline**
  - Hour-by-hour breakdown
  - Session visualization
  - Task associations

- **Focus by Task**
  - Task-specific analytics for the day
  - Time distribution

**Features:**
- Navigate through any historical date
- Compare different days
- Identify patterns in specific days

### 3. Week View

The Week view provides weekly summaries and trends.

**Components:**
- **Week Navigator**
  - Previous/Next week buttons
  - Week date range display
  - Weekly totals

- **Weekly Summary Cards**
  - Total focus time for the week
  - Total sessions
  - Daily average
  - Most productive day

- **Weekly Bar Chart**
  - Visual representation of daily focus time
  - Day-by-day comparison
  - Hover for exact values

- **Sessions by Day**
  - Expandable list of sessions for each day
  - Quick overview of daily activity

**Features:**
- Week starts on Sunday
- Compare week-over-week performance
- Identify weekly patterns

### 4. Year View

The Year view offers long-term insights and LeetCode-style visualizations.

**Components:**
- **Year Navigator**
  - Previous/Next year buttons
  - Year display
  - Yearly totals

- **Yearly Statistics**
  - Total focus time for the year
  - Total sessions
  - Active days count
  - Daily average

- **LeetCode-style Contribution Heatmap**
  - 365-day visualization
  - Color intensity based on focus time
  - Hover to see daily details
  - GitHub-style grid layout

- **Monthly Overview Bar Chart**
  - 12-month comparison
  - Focus time per month
  - Session count per month

- **Focus Points (LeetCode-style)**
  - Total Sessions badge
  - Focus Days badge
  - Total Hours badge
  - Longest Streak badge

**Features:**
- Full-year overview at a glance
- Identify seasonal patterns
- Track long-term progress
- Visual motivation through streaks

## Intensity Levels (Heatmap)

The heatmap uses 5 intensity levels based on daily focus time:

| Level | Focus Time | Color |
|-------|------------|-------|
| 0 | No activity | Light Gray |
| 1 | < 30 minutes | Gray |
| 2 | 30 min - 1 hour | Medium Gray |
| 3 | 1 hour - 2 hours | Dark Gray |
| 4 | 2+ hours | Black |

## Statistics Calculated

### Streak Calculation
- A streak is maintained by having at least one focus session per day
- Consecutive days with focus sessions increment the streak
- Missing a day resets the current streak
- Best streak is tracked separately

### Focus Time
- Calculated in seconds, displayed in hours and minutes
- Only "FOCUS" type sessions are counted
- Break sessions are excluded from focus time totals

### Session Counting
- Total sessions include all session types
- Focus sessions are filtered separately
- Interrupted sessions are still counted

### Daily Average
- Total time divided by number of active days
- Active days = days with at least one session
- Excludes days with zero activity

## Data Structure

### Session Object
```javascript
{
  id: string,
  type: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK",
  duration: number, // in seconds
  completedAt: string, // ISO date string
  taskId: string,
  taskTitle: string
}
```

### Stats Object
```javascript
{
  totalSessions: number,
  focusSessions: number,
  totalFocusTime: number, // in seconds
  averageSessionTime: number,
  currentStreak: number
}
```

## API Integration

### Endpoint
```
GET /api/analytics
```

### Query Parameters
- `view`: "today" | "day" | "week" | "month" | "year"
- `date`: ISO date string (optional)

### Response Format
```javascript
{
  success: true,
  data: {
    sessions: Session[],
    stats: {
      totalSessions: number,
      focusSessions: number,
      totalFocusTime: number,
      averageSessionTime: number,
      currentStreak: number
    },
    lifetime: {
      totalSessions: number,
      totalFocusTime: number,
      uniqueDays: number
    },
    timeline: Array<{
      hour: number,
      sessions: Session[]
    }>,
    daily: Array<{
      date: string,
      sessions: Session[],
      totalTime: number,
      focusTime: number
    }>,
    byTask: Record<string, {
      count: number,
      time: number
    }>
  }
}
```

## Local Storage

The analytics page reads data from localStorage for client-side analytics:

- **Key:** `focusSessions`
- **Format:** JSON array of session objects
- **Synced with:** Focus page session tracking

## Color Scheme

The analytics dashboard uses a consistent color scheme:

- **Primary:** Black (#000000) - Focus sessions, primary actions
- **Secondary:** Blue (#3B82F6) - Short breaks, secondary stats
- **Accent:** Green (#10B981) - Long breaks, positive metrics
- **Warning:** Orange (#F97316) - Streaks, fire elements
- **Error:** Red (#EF4444) - Interruptions (future)
- **Neutral:** Gray shades - Backgrounds, borders, inactive states

## Animations

All components use Framer Motion for smooth animations:

- **Page transitions:** Fade + slide (y: 20px)
- **Stat cards:** Scale on hover (1.02x)
- **Bar charts:** Height animation with stagger
- **Heatmap cells:** Scale in with delay
- **Timeline items:** Fade in + slide from left

## Responsive Design

The analytics page is fully responsive:

- **Mobile (< 768px):** Single column layout
- **Tablet (768px - 1024px):** Two column layout for some sections
- **Desktop (> 1024px):** Full multi-column layout with sidebars

## Performance Optimization

1. **Memoization:** Stats calculations are memoized
2. **Lazy Loading:** Components render on demand
3. **Virtual Scrolling:** For large session lists (future)
4. **Debounced Updates:** Real-time updates are debounced
5. **Efficient Filtering:** Date-based filtering optimized

## Accessibility

- **Keyboard Navigation:** All interactive elements are keyboard accessible
- **ARIA Labels:** Proper labels for screen readers
- **Color Contrast:** WCAG AA compliant
- **Focus Indicators:** Clear focus states
- **Semantic HTML:** Proper heading hierarchy

## Future Enhancements

1. **Export Data:** CSV/PDF export functionality
2. **Custom Date Ranges:** Pick any date range
3. **Comparison Mode:** Compare two time periods
4. **Goals Integration:** Track against set goals
5. **Predictive Analytics:** ML-based insights
6. **Tags & Categories:** More granular filtering
7. **Team Analytics:** Compare with friends/team
8. **Notifications:** Weekly/monthly summary emails
9. **Widgets:** Embeddable analytics widgets
10. **Dark Mode:** Theme switching support

## Known Issues

1. Large datasets (>1000 sessions) may cause slight lag in year view
2. Timezone handling needs improvement for international users
3. Real-time sync between focus page and analytics pending

## Browser Support

- Chrome/Edge: Full support (recommended)
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Tips for Users

1. **Consistent Tracking:** Track sessions daily for accurate streaks
2. **Task Association:** Link sessions to tasks for better insights
3. **Regular Review:** Check weekly view every Sunday
4. **Goal Setting:** Use yearly view to set annual goals
5. **Pattern Recognition:** Look for productive time patterns in day view

## Developer Notes

### Component Structure
```
app/dashboard/analytics/page.js
├── TodayView
│   ├── StatCard
│   ├── DailyTimeline
│   ├── FocusByTag
│   └── LifetimeStats
├── DayView
│   ├── StatCard
│   ├── DailyTimeline
│   └── FocusByTag
├── WeekView
│   ├── StatCard
│   ├── WeeklyBarChart
│   └── WeekSessionsList
└── YearView
    ├── StatCard
    ├── YearHeatmap
    ├── MonthlyBarChart
    └── FocusPoints
```

### State Management
- Local state with useState for view switching
- Session data loaded from localStorage on mount
- Date navigation state per view
- No global state needed (currently)

### Utility Functions
- `formatDuration(seconds)`: Converts seconds to "Xh Ym" format
- `calculateStreak()`: Calculates current streak from sessions
- `getIntensity(sessions)`: Determines heatmap cell intensity
- `generateCalendarDays()`: Creates calendar grid data

### Testing Checklist
- [ ] All views render correctly
- [ ] Date navigation works
- [ ] Stats calculations are accurate
- [ ] Animations are smooth
- [ ] Responsive layout works
- [ ] Tooltips appear on hover
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Data persists correctly
- [ ] Empty states display properly

## Support

For issues or feature requests related to analytics:
1. Check this documentation first
2. Review the codebase comments
3. Open a GitHub issue with the label "analytics"
4. Include screenshots and reproduction steps
