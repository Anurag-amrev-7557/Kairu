# Focus App - Session Management & Day Planner

A full-fledged web application for session management and day planning to help users focus, understand their work patterns, build focus habits, and track productivity logs.

## 🚀 Features

### Phase 1: Foundation
- ✅ User authentication (JWT-based)
- ✅ Multi-modal session tracking
- ✅ Context-aware logging (mood, energy, location)
- ✅ Smart calendar with natural language input
- ✅ MongoDB + Redis integration
- ✅ Responsive UI with Tailwind CSS

### Phase 2: Analytics & Insights
- ✅ Comprehensive analytics dashboard
- ✅ Today's focus tracking with timeline
- ✅ Day view with detailed daily analytics
- ✅ Week view with weekly summary and graphs
- ✅ Year view with LeetCode-style heatmap
- ✅ Focus streaks and lifetime statistics
- ✅ Focus time by task/tag visualization
- ✅ Calendar heatmap for focus visualization

### Phase 3: AI Features (NEW! 🤖)
- ✅ Natural language task creation with Gemini AI
- ✅ AI-powered focus insights and productivity analysis
- ✅ Smart task parsing (priority, dates, tags, duration)
- ✅ Personalized productivity recommendations
- 🔜 AI session reflection prompts
- 🔜 Predictive time estimation
- 🔜 Smart scheduling assistant

### Coming Soon
- Gamification & achievements
- Social features & focus rooms
- Integrations (Calendar, Slack, Spotify)

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, JavaScript (ES6+), Tailwind CSS
- **Backend:** Node.js, Express.js, Next.js API Routes
- **Database:** MongoDB with Mongoose ODM
- **Caching:** Redis (ioredis)
- **State Management:** Zustand
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.io
- **AI:** Google Gemini API
- **Deployment:** Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd orbitly
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/focus-app

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# AI Features (Gemini API)
GEMINI_API_KEY=your-gemini-api-key
```

4. Run MongoDB and Redis locally:
```bash
# MongoDB
mongod

# Redis
redis-server
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
orbitly/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── sessions/     # Session management
│   │   └── tasks/        # Task management
│   ├── (auth)/           # Auth pages (login, register)
│   ├── layout.js         # Root layout
│   ├── page.js           # Landing page
│   └── globals.css       # Global styles
├── components/           # React components
├── lib/
│   ├── db/              # Database connections
│   │   ├── mongodb.js   # MongoDB connection
│   │   └── redis.js     # Redis connection
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Session.js
│   │   ├── Task.js
│   │   └── Goal.js
│   ├── store/           # Zustand stores
│   │   ├── authStore.js
│   │   ├── sessionStore.js
│   │   └── taskStore.js
│   └── auth.js          # Auth utilities
├── public/              # Static assets
└── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Sessions
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/[id]` - Get session by ID
- `PATCH /api/sessions/[id]` - Update session (end, pause, resume, add interruption)
- `DELETE /api/sessions/[id]` - Delete session

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task

### Analytics
- `GET /api/analytics?view=today&date=2025-01-01` - Get analytics data
  - Query params:
    - `view`: today, day, week, month, year
    - `date`: ISO date string (optional, defaults to current date)

### AI Features
- `POST /api/ai/parse-task` - Parse natural language into structured task
- `GET /api/ai/insights?days=30` - Generate personalized focus insights
- `POST /api/ai/reflection` - Get AI reflection prompts for a session

## 🎯 Roadmap

### MVP (6 Weeks)
- [x] Basic authentication
- [x] Session tracking with timer
- [x] MongoDB & Redis setup
- [x] API endpoints
- [x] Landing & auth pages
- [ ] Dashboard UI
- [ ] Session timer component
- [ ] Daily planner
- [ ] Basic analytics

### Phase 2 (Weeks 5-9)
- [ ] Deep analytics dashboard
- [ ] Flow state detection
- [ ] Productivity scoring
- [ ] Charts & visualizations

### Phase 3 (In Progress)
- [x] Natural language task creation
- [x] AI focus insights
- [ ] Predictive planning
- [ ] Smart scheduling

### Phase 4+
- [ ] Gamification system
- [ ] Social features
- [ ] Calendar integrations

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
- Use MongoDB Atlas for production database
- Use Upstash Redis or Redis Cloud for production
- Update `NEXTAUTH_URL` to your production URL

## 🤖 AI Features

Orbitly now includes powerful AI features powered by Google Gemini:

### Natural Language Task Creation
Create tasks by simply describing them in plain English:
- "Work on backend API tomorrow at 2pm for 2 hours, high priority"
- "Design landing page by Friday, needs creative energy"

### AI Focus Insights
Get personalized productivity insights:
- Best time of day analysis
- Interruption pattern detection
- Mood and energy correlations
- Actionable recommendations

📖 **[Read full AI Features documentation →](./AI_FEATURES.md)**

### Setup AI Features
1. Get a free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env.local`:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```
3. Restart dev server and visit `/dashboard/ai-assistant`

## 📝 License

MIT

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Built with ❤️ for productivity enthusiasts | Powered by 🤖 Google Gemini AI
