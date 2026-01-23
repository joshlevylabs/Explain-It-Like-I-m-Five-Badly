# AI Description Generation

This feature automatically generates witty, one-liner descriptions for user-submitted explanations using OpenAI's GPT models.

## Overview

When a user submits a terrible explanation, the system automatically generates a brief, humorous description that captures what makes the explanation delightfully wrong or confusing. These descriptions appear above the explanation content in the card view.

## How It Works

1. **User submits an explanation** via the submission form
2. **API receives the submission** and validates it
3. **OpenAI generates a description** based on the topic and explanation content
4. **The explanation is saved** with its AI-generated description to the database
5. **Users see the description** displayed above the explanation in the feed

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

## Future Improvements

Potential enhancements:
- Regenerate descriptions for existing explanations
- Allow users to request a new description
- Add description caching to reduce API calls
- Support multiple language models
- Add A/B testing for different prompt styles
