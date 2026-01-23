# Account Settings Feature

This document describes the user account and settings functionality for the "Explain It Like I'm Five... Badly" application.

## Overview

The account settings feature allows users to:
- Create an account and sign in
- Manage their profile (name)
- Change their password
- Add their own OpenAI API key for AI-generated descriptions

## Authentication

### Technology Stack
- **NextAuth.js** - Authentication framework
- **Credentials Provider** - Email/password authentication
- **bcryptjs** - Password hashing
- **JWT Sessions** - Stateless session management

### Sign Up
New users can create an account at `/auth/signup` with:
- Email (required, unique)
- Password (required, minimum 8 characters)
- Name (optional)

After successful registration, users are automatically signed in.

### Sign In
Existing users can sign in at `/auth/signin` with their email and password.

### Session Management
Sessions are managed using JWT tokens, providing stateless authentication that works well with serverless deployments.

## Account Settings Page

Located at `/settings`, the account settings page includes:

### Profile Section
- View and update display name
- View email (read-only)

### Password Section
- Change password (requires current password)
- New password must be at least 8 characters

### OpenAI API Key Section
Users can add their own OpenAI API key to enable AI-generated descriptions for their explanations.

**Features:**
- Securely encrypted storage using AES-256-GCM
- Visual indicator showing if an API key is configured
- Ability to update or remove the API key
- Basic validation (key must start with `sk-`)

### Danger Zone
- Sign out button

## API Routes

### Authentication Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js handler |
| `/api/auth/register` | POST | User registration |

### User Management Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/user/profile` | PATCH | Update user profile |
| `/api/user/password` | PATCH | Change password |
| `/api/user/api-key` | GET | Check if API key exists |
| `/api/user/api-key` | PUT | Save/update API key |
| `/api/user/api-key` | DELETE | Remove API key |

## Database Schema

The User model stores:
```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String?
  password       String    // bcrypt hashed
  openaiApiKey   String?   // AES-256-GCM encrypted
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  explanations   Explanation[]
}
```

## Security

### Password Security
- Passwords are hashed using bcryptjs with 12 rounds
- Minimum password length of 8 characters enforced

### API Key Encryption
- API keys are encrypted using AES-256-GCM
- Encryption key derived from `ENCRYPTION_KEY` or `NEXTAUTH_SECRET`
- Each encrypted value includes its own IV and auth tag

### Session Security
- JWT-based sessions with configurable secret
- HTTP-only cookies for session storage
- CSRF protection via NextAuth.js

## Configuration

### Environment Variables
```env
# Required for authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional: Separate encryption key for API keys
ENCRYPTION_KEY=your-encryption-key
```

## Components

### UserMenu
Located in the navigation bar, provides:
- Sign in link for unauthenticated users
- User avatar/initials dropdown for authenticated users
- Quick access to Settings and Sign out

### Providers
The `Providers` component wraps the app with `SessionProvider` from NextAuth.js.

## Usage Examples

### Checking Authentication Status
```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

### Server-Side Session Check
```typescript
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // User is authenticated
}
```

### Protecting a Page
```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/protected");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <div>Loading...</div>;
  }

  return <div>Protected content</div>;
}
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   └── user/
│   │       ├── api-key/route.ts
│   │       ├── password/route.ts
│   │       └── profile/route.ts
│   ├── auth/
│   │   ├── error/page.tsx
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── Providers.tsx
│   └── UserMenu.tsx
├── lib/
│   ├── auth/
│   │   ├── config.ts
│   │   └── session.ts
│   └── encryption.ts
└── types/
    └── next-auth.d.ts
```
