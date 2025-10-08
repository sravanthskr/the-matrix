# The Matrix - Movie API Platform

A complete movie database API platform with authentication, rate limiting, and a sleek Matrix-inspired interface. Built entirely on Cloudflare's infrastructure with Firebase authentication.

Live Site: [the-matrix-237.pages.dev](https://the-matrix-237.pages.dev/)

Base API URL: [thematrix.sravanthskr2004.workers.dev](https://thematrix.sravanthskr2004.workers.dev)

## What Is This Project?

The Matrix is a full-stack movie database API platform where developers can:
- Sign up and get their own API key
- Access thousands of movies through a RESTful API
- Track their API usage in real-time
- Search and filter movies by genre, year, title, and more

The platform handles everything from user authentication to rate limiting, giving each user 100 requests per day and 3,000 requests per month.

## Screenshots

### Landing Page
**Matrix-themed landing page with green digital rain**
<img width="1900" height="593" alt="image" src="https://github.com/user-attachments/assets/a34006dd-1ade-4cd7-b090-f9395ed4500e" />


### Dashboard
**User dashboard showing API key and usage statistics**
<img width="1919" height="419" alt="image" src="https://github.com/user-attachments/assets/dc5e7d8b-2fc0-4c31-8475-060d36e993ad" />

Video Demo: [Watch here](https://streamable.com/t7pa4s)

## How It All Works

### The Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloudflare     │    │  Cloudflare     │    │  Cloudflare     │
│  Pages          │    │  Workers        │    │  D1 SQLite      │
│  (React UI)     │────│  (API Logic)    │────│  (Data Layer)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                      │                      │
         │ - Auth forms         │ - Route handling    │ - Tables: users,
         │ - Dashboard          │ - Rate checks       │   api_keys, movies
         │ - Docs               │ - Token verify      │ - Indexes for speed
         └──────────────────────┘ - Usage increments  └──────────────────┘
                  │
                  └── Firebase Auth (Tokens & Email Verify)
```

This project uses a serverless architecture with three main components:

1. **Cloudflare D1 Database** - Stores movies, users, API keys, and usage data
2. **Cloudflare Workers** - Serverless backend handling all API requests
3. **React Frontend** - Matrix theme interface deployed on Cloudflare Pages
4. **Firebase Auth** - Secure user authentication and email verification

### The Implementation

Here's how this entire platform was built from the ground up:

#### Step 1: Database Design (Cloudflare D1)

First, I created a SQLite database schema on Cloudflare D1 with these tables:

**Users Table** – Stores user accounts
- Email, password hash, verification status
- Timestamp for account creation

**API Keys Table** – One API key per verified user
- Linked to user ID
- Includes daily/monthly limits (1000/day, 10000/month)
- Activation status and creation timestamp

**Movies Table** – The core data
- Title, year, runtime, rating
- Director, plot, poster URL
- Unique constraint on title + year combo

**Movie Genres Table** – Many-to-many relationship
- One entry per movie-genre pair
- Separate table for efficient filtering and categorization

**Movie Cast Table** – Many-to-many relationship
- Stores actors and roles linked to movies
- Unique combination of movie, actor, and role

**Usage Logs Table** – Tracks all API requests
- Linked to API key
- Endpoint, timestamp, and status code
- Used for debugging and analytics

**Daily Usage Table** – Monitors API consumption
- Tracks daily request counts per API key
- Supports rate limiting and usage summaries

**Rate Limits Table** – Backup store for rate limit windows
- Tracks per-key request count and reset times
- Used for recovery and distributed rate limit enforcement

**Indexes** – Improve query performance
- Indexes on movies (title, year), genres, cast, usage logs, and daily usage for faster lookups and joins

The schema was designed for performance with proper indexes on frequently queried fields like movie title, year, and API key lookups.

#### Step 2: Backend API (Cloudflare Workers)

Next came the serverless backend. I built a Cloudflare Worker that handles:

**Public Endpoints** (require API key):
- `GET /api/movies` - List movies with pagination
- `GET /api/movies/{id}` - Get specific movie
- `GET /api/search?q=title` - Search movies
- `GET /api/genres` - List all genres
- `GET /api/years` - List available years
- `GET /api/stats` - Database statistics

**Authentication Endpoints** (Firebase integration):
- `POST /api/auth/login` - Verify Firebase token and get/create API key
- `POST /api/auth/get-api-key` - Retrieve API key for verified users
- `POST /api/auth/usage` - Get current usage stats

**The Rate Limiting System:**

Every API request goes through a validation pipeline:
1. Check if API key exists in database
2. Verify API key is active
3. Check daily usage (max 100)
4. Check monthly usage (max 3000)
4. If limits exceeded → return 429 error
5. If valid → increment counters and allow request
6. Return usage headers (`X-Rate-Limit-Remaining`, `X-Rate-Limit-Reset`)

The worker tracks usage in real-time, updating the `daily_usage` table with each request. When a user hits their limit, they're blocked until the next day/month.

#### Step 3: Firebase Authentication Setup

For user management, I integrated Firebase Authentication:

**Why Firebase?**
- Email verification built-in
- Secure token-based auth
- No need to handle passwords directly
- Easy integration with frontend

**The Auth Flow:**
1. User signs up with email/password
2. Firebase sends verification email
3. User clicks verification link
4. User logs in → Firebase returns ID token
5. Frontend sends token to Workers backend
6. Worker verifies token with Firebase
7. Worker creates/retrieves API key from D1 database
8. User gets their API key

This way, only verified email addresses get API keys, preventing spam accounts.

#### Step 4: Frontend Development - The Initial Version

I started with a simple HTML/CSS/JavaScript frontend to test everything:

**Initial Frontend (HTML/CSS/JS):**
- Basic login/signup forms
- Dashboard showing API key
- Simple API documentation
- Usage statistics display

This bare-bones version was purely functional - no fancy UI, just working features. The goal was to ensure:
- Firebase auth works correctly
- API key generation succeeds
- Backend endpoints respond properly
- Rate limiting functions as expected

Once I confirmed everything worked end-to-end, I moved to building the real UI.

#### Step 5: Building The Final UI - React & Matrix Theme

With the backend proven stable, I rebuilt the frontend properly:

**Technology Stack:**
- **React 18** - Component-based UI
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

**The Matrix Theme:**
- Digital rain effect inspiration

**Pages Built:**
- **Home** - Hero section with feature showcase
- **Login/Signup** - Firebase auth forms with validation
- **Dashboard** - API key display, usage charts, documentation
- **404** - Custom not found page

**Key Features Implemented:**
- Real-time usage tracking with progress bars
- Copy-to-clipboard for API key
- Dark mode optimized (no light mode - it's The Matrix!)
- Responsive design for all devices
- Interactive API documentation
- Email verification flow

#### Step 6: Connecting Frontend to Backend

The frontend communicates with both Firebase and Cloudflare Workers:

**Firebase Integration:**
- `client/src/lib/firebase.ts` - Firebase config
- `onAuthStateChanged` - Track login status
- Token management for API calls

**Backend Integration:**
- `https://thematrix.sravanthskr2004.workers.dev` - Workers endpoint
- Sends Firebase ID token for authentication
- Receives API key after verification
- Fetches usage stats with the API key

**The Complete User Flow:**

1. **New User Signs Up**
   - Enters email/password in React form
   - Firebase creates account
   - Verification email sent automatically
   - User clicks link to verify

2. **User Logs In**
   - Firebase authenticates user
   - Frontend gets Firebase ID token
   - Sends token to Workers: `POST /api/auth/login`
   - Workers verifies with Firebase
   - Workers checks D1 database:
     - If verified → create API key (if not exists)
     - If not verified → error message
   - Returns API key to frontend

3. **Using the API**
   - User copies API key from dashboard
   - Makes requests to `/api/movies` with `X-API-Key` header
   - Workers checks rate limits in D1
   - If under limit → returns data + updates usage
   - If over limit → returns 429 error
   - Dashboard shows real-time usage stats

#### Step 7: Deployment

**Frontend Deployment (Cloudflare Pages):**
- Connected GitHub repository
- Build command: `npm run build`
- Output: `dist/public`
- Environment variables for Firebase config
- Automatic HTTPS and CDN

**Backend Deployment (Cloudflare Workers):**
- Added `worker.js` 
- Deployed on `thematrix.sravanthskr2004.workers.dev`
- Connected to D1 database
- CORS enabled for frontend access
- Rate limiting enforced globally

**Database (Cloudflare D1):**
- Created with schema from `schema.sql`
- Populated with movie data

## Local Development Setup

Want to run this locally? Here's how:

### Prerequisites

- Node.js 20 or higher
- A Firebase project (free tier works)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/sravanthskr/the-matrix.git
   cd the-matrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env` file in the root:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

The app will connect to the live Cloudflare Workers backend automatically.

### Building for Production

```bash
npm run build
```

This creates an optimized build in `dist/public/` ready for deployment.

## Technical Highlights

### Rate Limiting Implementation

The rate limiting system uses a hybrid approach:

1. **Database Tracking** - D1 stores all usage data
2. **Per-Request Validation** - Every API call checks current usage
3. **Time-based Resets** - Daily counters reset at midnight UTC
4. **Header Communication** - Usage info sent in response headers

Example rate limit response:
```
X-Rate-Limit-Remaining: 87
X-Rate-Limit-Reset: 2024-10-09T00:00:00Z
```

### Security Features

- **Firebase ID Token Verification** - Workers verify tokens before creating API keys
- **Email Verification Required** - Only verified emails get API access
- **CORS Properly Configured** - Prevents unauthorized domains
- **SQL Injection Prevention** - Parameterized queries throughout
- **Environment Variables** - Sensitive config never in code

### Performance Optimizations

- **Edge Computing** - Workers run globally, near users
- **Indexed Queries** - D1 tables optimized with indexes
- **Pagination** - Large result sets split into pages
- **Lazy Loading** - Frontend components load on demand
- **Code Splitting** - Vite creates optimized bundles

## API Usage Example

Once you have an API key, use it like this:

```javascript
// Fetch all movies
fetch('https://thematrix.sravanthskr2004.workers.dev/api/movies', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
})
.then(res => res.json())
.then(data => console.log(data));

// Search movies
fetch('https://thematrix.sravanthskr2004.workers.dev/api/search?q=matrix', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

## Technologies Used

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- Firebase Authentication
- TanStack Query (data fetching)
- Framer Motion (animations)
- Wouter (routing)

**Backend:**
- Cloudflare Workers (serverless)
- Cloudflare D1 (SQLite database)
- Firebase Admin (token verification)

**Deployment:**
- Cloudflare Pages (frontend)
- Cloudflare Workers (backend)
- GitHub (version control)

## Future Enhancements

Potential features to add:

- [ ] WebSocket support for real-time updates
- [ ] OAuth integration (Google, GitHub login)
- [ ] Advanced analytics dashboard
- [ ] API playground for testing endpoints
- [ ] Webhook support for usage alerts
- [ ] Team accounts with shared API keys
- [ ] Premium tier with higher limits

## License

This project is licensed under the MIT License.
See the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! If you find a bug, want to add a feature, or improve documentation:  

1. Open an issue to discuss your idea.  
2. Fork the repository and create a feature branch.  
3. Make your changes and commit with clear messages.  
4. Submit a pull request describing your changes.  

---

**Sic mundus creatus est - Thus the world was created**
