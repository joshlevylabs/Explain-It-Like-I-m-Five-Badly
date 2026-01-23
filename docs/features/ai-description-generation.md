# AI-Powered Features

This document covers the AI features powered by OpenAI's GPT models.

## Features Overview

1. **AI Description Generation** - Automatically generates witty descriptions for submitted explanations
2. **AI Explanation Generation** - Users can generate bad explanations using their own OpenAI API key

---

## AI Description Generation

When a user submits a terrible explanation, the system automatically generates a brief, humorous description that captures what makes the explanation delightfully wrong or confusing. These descriptions appear above the explanation content in the card view.

## How It Works

1. **User submits an explanation** via the submission form
2. **API receives the submission** and validates it
3. **OpenAI generates a description** based on the topic and explanation content
4. **The explanation is saved** with its AI-generated description to the database
5. **Users see the description** displayed above the explanation in the feed

## API Trigger on Submission

The OpenAI API request is automatically triggered when a new post is submitted through the `/api/explanations` POST endpoint. No additional user action is required - the AI description is generated as part of the normal submission flow.

### Complete Submission Flow

```
┌─────────────────┐    POST /api/explanations    ┌──────────────────┐
│  SubmitForm.tsx │ ─────────────────────────────>│  route.ts POST   │
│                 │    { topic, content }         │                  │
└─────────────────┘                               └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │ Validate input   │
                                                  │ Check rate limit │
                                                  └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │ generateExplana- │
                                                  │ tionDescription()│──────> OpenAI API
                                                  └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │ Save to database │
                                                  │ with description │
                                                  └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │ Return response  │
                                                  │ with explanation │
                                                  └──────────────────┘
```

### Implementation Details

**Location:** `src/app/api/explanations/route.ts`

```typescript
// POST handler for new submissions
export async function POST(request: NextRequest) {
  // ... validation and rate limiting ...

  const trimmedTopic = topic.trim();
  const trimmedContent = content.trim();

  // Automatically trigger AI description generation
  const description = await generateExplanationDescription(
    trimmedTopic,
    trimmedContent
  );

  // Save with generated description
  const [explanation] = await prisma.$transaction([
    prisma.explanation.create({
      data: {
        topic: trimmedTopic,
        content: trimmedContent,
        description, // AI-generated description (or null if generation fails)
      },
    }),
    // ... rate limit logging ...
  ]);

  // ...
}
```

### Request Data

The API request to OpenAI includes:
- **Topic**: The serious topic being explained (e.g., "Quantum Physics")
- **Explanation content**: The user's terrible explanation text

This data is passed to the `generateExplanationDescription` function which formats it into a prompt for the OpenAI API.

**OpenAI API Request Parameters:**
```typescript
{
  model: "gpt-4o-mini",           // Configurable via OPENAI_MODEL env var
  messages: [
    { role: "system", content: "..." },  // Instructions for witty descriptions
    { role: "user", content: "Topic: {topic}\nTerrible Explanation: \"{content}\"..." }
  ],
  max_tokens: 60,                 // Keep responses concise
  temperature: 0.8                // Allow creative responses
}
```

### Automatic Behavior

- The API call happens **synchronously** during post submission
- No user action required - generation is automatic
- If OpenAI is unavailable or not configured, the post still saves (with `description: null`)
- The response includes the generated description when successful

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Required for AI descriptions (optional - feature degrades gracefully without it)
OPENAI_API_KEY=your-openai-api-key-here

# Optional: Override the default model
OPENAI_MODEL=gpt-4o-mini  # Default value
```

### Getting an API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Add it to your `.env` file

## API Reference

### `generateExplanationDescription(topic: string, explanation: string)`

**Location:** `src/lib/openai.ts`

Generates a witty description for a terrible explanation.

**Parameters:**
- `topic` - The topic being explained (e.g., "Quantum Physics")
- `explanation` - The terrible explanation content

**Returns:** `Promise<string | null>`
- A description string (max ~100 characters) if successful
- `null` if OpenAI is not configured or generation fails

**Example:**
```typescript
import { generateExplanationDescription } from "@/lib/openai";

const description = await generateExplanationDescription(
  "Photosynthesis",
  "It's when plants eat sunlight for breakfast and burp out oxygen"
);
// Returns something like: "Plants on a sunshine diet with extra burps"
```

## Database Schema

The `Explanation` model includes an optional `description` field:

```prisma
model Explanation {
  id          String    @id @default(cuid())
  topic       String
  content     String
  description String?   // AI-generated witty description
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  upvotes     Int       @default(0)
  downvotes   Int       @default(0)
  votes       VoteLog[]
}
```

## UI Display

The description appears in the `ExplanationCard` component, styled as italic text above the main explanation content:

```tsx
{explanation.description && (
  <p className="text-zinc-500 dark:text-zinc-400 italic text-sm mb-3">
    {explanation.description}
  </p>
)}
```

## Graceful Degradation

The feature is designed to work without an OpenAI API key:

- If `OPENAI_API_KEY` is not set, descriptions are simply `null`
- The UI conditionally renders the description only when present
- Existing explanations without descriptions continue to work normally
- No errors are thrown - the app functions fully without AI

## Prompt Engineering

The AI is prompted to:
- Keep descriptions under 100 characters
- Be playful and light-hearted
- Reference specific absurd elements from the explanation
- Avoid being mean-spirited
- Use Reddit/Twitter humor style
- Minimize emoji usage

## Cost Considerations

- Uses `gpt-4o-mini` by default (most cost-effective)
- Each description generation is ~200-300 tokens total
- Rate limiting on submissions (5/day per IP) naturally limits API costs

## Error Handling

- OpenAI API errors are caught and logged
- Failed generations return `null` (no description shown)
- Network timeouts are handled gracefully
- The submission still succeeds even if description generation fails

## Testing

To test the feature:

1. Set a valid `OPENAI_API_KEY` in `.env`
2. Start the dev server: `npm run dev`
3. Submit a new explanation via the form
4. Check the explanation card for the AI-generated description

---

## AI Explanation Generation

Users can generate terrible explanations using AI by clicking the "Generate" button in the submission form. This feature requires users to provide their own OpenAI API key.

### User Flow

1. **Sign in** to your account
2. **Add your OpenAI API key** in Account Settings (`/settings`)
3. **Enter a topic** in the submission form (e.g., "Quantum Physics")
4. **Click "Generate"** to create an AI-generated bad explanation
5. **Review and edit** the generated content (optional)
6. **Submit** the explanation or click "Generate" again for a new one

### Setup Requirements

Users must:
1. Have an account and be signed in
2. Have an OpenAI API key saved in their Account Settings
3. Have sufficient credits in their OpenAI account

### API Endpoint

**POST `/api/generate`**

Generates a terrible explanation for a given topic.

**Request:**
```json
{
  "topic": "Blockchain"
}
```

**Response:**
```json
{
  "explanation": "Blockchain is like a really long receipt that everyone in the world has a copy of, but nobody can throw it away or use white-out on it."
}
```

**Error Responses:**
- `401` - Not signed in
- `400` - Missing topic or no API key configured
- `402` - Insufficient OpenAI credits
- `429` - OpenAI rate limit reached
- `500` - Generation failed

### API Reference

#### `generateBadExplanation(topic: string, apiKey: string)`

**Location:** `src/lib/openai.ts`

Generates a hilariously bad explanation for a given topic.

**Parameters:**
- `topic` - The topic to explain badly
- `apiKey` - The user's OpenAI API key

**Returns:** `Promise<string>`

**Example:**
```typescript
import { generateBadExplanation } from "@/lib/openai";

const explanation = await generateBadExplanation(
  "Taxes",
  "sk-your-api-key"
);
// Returns something like: "Taxes are when the government takes some of
// your allowance because they need to buy a really big pizza for everyone..."
```

### UI Components

The "Generate" button appears next to the topic input:

- **Purple button** indicates AI generation feature
- **Disabled state** when user isn't signed in or has no API key
- **Loading spinner** during generation
- **Helper text** guides users to add their API key if missing

### Security

- User API keys are **encrypted** before storing in the database
- Keys are **decrypted only** when making API calls
- Keys are **never exposed** to the client
- Each user can only use their own API key

### Cost Considerations

- Uses `gpt-4o-mini` by default (most cost-effective)
- Each generation is ~200-400 tokens
- Users pay for their own OpenAI usage
- No rate limiting beyond OpenAI's own limits

---

## Future Improvements

Potential enhancements:
- Regenerate descriptions for existing explanations
- Support for alternative AI providers (Anthropic, etc.)
- Style presets (more absurd, more technical, etc.)
- Generation history for users
