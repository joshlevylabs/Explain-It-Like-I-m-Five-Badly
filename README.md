# Explain It Like I'm Five... Badly

Terrible explanations of serious things.

## What is this?

Users try to explain complex topics as badly as possible, but still technically correct.

**Examples:**
- "Blockchain is a notebook that everyone owns and no one can erase, except when they can."
- "Quantum Physics is when a cat is both alive and dead because nobody bothered to check."

## Features

- **Submit Explanations**: Share your terrible explanations of serious topics
- **AI-Generated Descriptions**: Each submission gets a witty one-liner description powered by OpenAI
- **Vote System**: Upvote the funniest explanations (= made me laugh) or downvote (= needs more chaos)
- **"Did This Help?" Feedback**: Yes / Absolutely Not - both answers are celebrated!
- **Rate Limiting**: Prevents spam (5 submissions/day, 10 votes/minute)
- **Playful UX**: Encouraging microcopy that makes "bad" mean "hilariously creative"
- **Kind Community Tone**: Clear guidance that "bad" means funny, not mean or hurtful
- **Tone-Setting Guide**: "How to Be Wonderfully Terrible" section with clear DOs and DON'Ts

### Interactive Feed Features

- **Community Stats**: Live count of explanations and votes with animated counters
- **Trending Topics**: See what topics are hot right now, click to filter
- **Search**: Find explanations by topic or content
- **View Modes**: Toggle between comfortable and compact views
- **Share Functionality**: Copy explanations or share to X (Twitter)
- **Toast Notifications**: Visual feedback for user actions
- **Scroll to Top**: Quick navigation button when scrolling
- **Smooth Animations**: Staggered card animations, hover effects, and micro-interactions

## What Does "Bad" Mean?

**"Bad" on this platform means:**
- Hilariously oversimplified
- Delightfully confusing
- Technically-ish correct
- Creative and silly

**"Bad" does NOT mean:**
- Mean-spirited or cruel
- Factually wrong in harmful ways
- Offensive or hurtful

This distinction is reinforced throughout the UI with playful microcopy and clear guidance to encourage humor while discouraging negativity.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# (Optional) Configure OpenAI for AI descriptions
# Copy .env.example to .env and add your OPENAI_API_KEY

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS

## Documentation

- [User Submissions](docs/features/user-submissions.md) - How to submit explanations
- [AI Description Generation](docs/features/ai-description-generation.md) - Automatic witty descriptions via OpenAI
- [Tone and Microcopy](docs/features/tone-and-microcopy.md) - Voice guidelines and UI copy patterns
- [Interactive Feeds](docs/features/interactive-feeds.md) - Feed UI components and interactions

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/explanations` | Get all explanations |
| POST | `/api/explanations` | Submit a new explanation |
| GET | `/api/explanations/[id]/vote` | Get vote status |
| POST | `/api/explanations/[id]/vote` | Vote on an explanation |

## Project Structure

```
src/
├── app/
│   ├── api/explanations/     # API routes
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles and animations
│   └── layout.tsx            # Root layout
├── components/
│   ├── SubmitForm.tsx        # Submission form
│   ├── Feed.tsx              # Explanations feed with filtering
│   ├── FeedHeader.tsx        # Stats, search, and view controls
│   ├── ExplanationCard.tsx   # Individual explanation with share
│   ├── SkeletonCard.tsx      # Loading placeholder
│   ├── Toast.tsx             # Toast notification system
│   └── ScrollToTop.tsx       # Scroll to top button
└── lib/
    ├── prisma.ts             # Database client
    ├── openai.ts             # OpenAI integration for descriptions
    ├── rate-limit.ts         # Rate limiting utilities
    └── constants.ts          # App constants
```

## License

MIT
