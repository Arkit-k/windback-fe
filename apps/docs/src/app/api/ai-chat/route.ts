import { NextResponse } from "next/server";
import { source } from "@/lib/source";

const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_BASE_URL = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
const AI_MODEL = process.env.AI_MODEL || "google/gemini-2.0-flash-001";

function getDocsContext(): string {
  const pages = source.getPages();
  const parts: string[] = [];

  for (const page of pages) {
    const title = page.data.title || "";
    const description = page.data.description || "";
    const url = page.url;
    parts.push(`## ${title}\nURL: ${url}\n${description}\n`);
  }

  return parts.join("\n");
}

const SYSTEM_PROMPT = `You are the Windback AI assistant embedded in the documentation site. Windback is an AI-powered churn recovery platform for SaaS companies.

Your job is to help developers and users understand Windback's features, API, SDKs, integrations, and best practices.

Key facts:
- Windback detects cancellations and failed payments via webhooks (Stripe, Razorpay, Paddle, Dodo, custom)
- AI generates personalized recovery email variants with 9+ strategies
- Smart dunning sequences for failed payments
- Churn risk scoring with 13 negative + 5 positive signals
- Cancel flow widget captures cancel reasons and shows retention offers
- SDKs available for Node.js, Python, and Go
- API uses JWT or API keys (public pub_ and secret sk_)
- Base API URL: https://api.windbackai.com/api/v1

Here is a summary of the documentation pages:

`;

export async function POST(request: Request) {
  try {
    const { query, history } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    if (!AI_API_KEY) {
      return NextResponse.json(
        { answer: "AI chat is not configured. Please set the AI_API_KEY environment variable." },
        { status: 200 }
      );
    }

    const docsContext = getDocsContext();

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + docsContext },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: query },
    ];

    const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("AI API error:", err);
      return NextResponse.json(
        { answer: "Sorry, I'm having trouble connecting to the AI service. Please try again." },
        { status: 200 }
      );
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { answer: "Something went wrong. Please try again." },
      { status: 200 }
    );
  }
}
