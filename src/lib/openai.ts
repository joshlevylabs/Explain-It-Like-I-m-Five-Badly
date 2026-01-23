import OpenAI from "openai";

// Lazy initialization - only create client when needed
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

/**
 * Creates an OpenAI client with a specific API key.
 * Used for user-provided API keys.
 */
function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

/**
 * Generates a humorous, brief description of a terrible explanation.
 * The description captures why the explanation is hilariously wrong
 * or what makes it delightfully confusing.
 */
export async function generateExplanationDescription(
  topic: string,
  explanation: string
): Promise<string | null> {
  const openai = getOpenAIClient();

  if (!openai) {
    console.warn("OPENAI_API_KEY not configured, skipping description generation");
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a witty comedy writer for "Explain It Like I'm Five... Badly", a humor site featuring intentionally terrible explanations of serious topics.

Your job is to write a SHORT, funny one-liner description (max 100 characters) that captures what makes each explanation delightfully wrong or confusing.

Guidelines:
- Keep it under 100 characters
- Be playful and light-hearted
- Reference specific absurd elements from the explanation
- Don't be mean-spirited or condescending
- Use the humor style of Reddit comments or Twitter
- No emojis unless they really add to the joke`,
        },
        {
          role: "user",
          content: `Topic: ${topic}
Terrible Explanation: "${explanation}"

Write a witty one-liner description (under 100 chars) that captures why this explanation is gloriously wrong:`,
        },
      ],
      max_tokens: 60,
      temperature: 0.8,
    });

    const description = response.choices[0]?.message?.content?.trim();

    // Ensure we return a reasonable description
    if (!description || description.length === 0) {
      return null;
    }

    // Trim if somehow too long
    if (description.length > 150) {
      return description.substring(0, 147) + "...";
    }

    return description;
  } catch (error) {
    console.error("Failed to generate description:", error);
    return null;
  }
}

/**
 * Generates a terrible/funny explanation for a given topic.
 * Uses the user's provided API key.
 */
export async function generateBadExplanation(
  topic: string,
  apiKey: string
): Promise<string> {
  const openai = createOpenAIClient(apiKey);

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a comedy writer for "Explain It Like I'm Five... Badly", a humor site where people create intentionally terrible (but kind and playful) explanations of serious topics.

Your job is to generate a hilariously bad explanation that a confused 5-year-old might give after mishearing adults talk.

Guidelines:
- Keep it 2-4 sentences max
- Be hilariously oversimplified or wonderfully confused
- Use silly analogies or mix up concepts in funny ways
- Sound like a confident kid who has no idea what they're talking about
- Be playful and light-hearted, never mean or hurtful
- Can use made-up logic that sounds almost right but is gloriously wrong
- Avoid anything offensive, political, or controversial

Examples of the tone:
- "Blockchain is like a notebook that everyone has a copy of, but nobody can use an eraser, except sometimes they can if enough people agree to pretend they didn't see what was written."
- "Taxes are when the government takes some of your allowance because they need to buy a really big pizza for everyone, but you never get any pizza."`,
      },
      {
        role: "user",
        content: `Generate a hilariously bad explanation for: ${topic}`,
      },
    ],
    max_tokens: 200,
    temperature: 0.9,
  });

  const explanation = response.choices[0]?.message?.content?.trim();

  if (!explanation) {
    throw new Error("Failed to generate explanation");
  }

  return explanation;
}
