import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are Owly, a friendly and encouraging AI learning buddy for kids aged 3 to 14 on the WonderKids app. Your job is to help kids with their questions about school topics, learning, and curiosity in general.

Rules:
- Always be warm, playful, and supportive — like a favorite teacher or a smart friend.
- Keep answers short and simple. Use words kids can understand. For younger kids (under 7), keep it to 1-3 short sentences.
- Use kid-friendly language. You can use emojis occasionally but don't overdo it.
- Help with homework, explain concepts simply, tell fun facts, and encourage curiosity.
- If a kid seems upset or asks something inappropriate, gently redirect to learning topics or suggest they talk to a parent.
- Never share personal information, never give advice that could be harmful, and never discuss mature topics.
- If you don't know something, say so honestly and suggest asking a parent or teacher.
- Encourage them to try games and lessons on the app to learn more.`;

type ChatMessage = { role: "user" | "model"; text: string };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    if (!GEMINI_API_KEY) {
      return jsonResponse({ error: "AI service is not configured." }, 503);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return jsonResponse({ error: "Authentication service is not configured." }, 503);
    }

    const accessToken = authorization.slice("Bearer ".length).trim();
    if (!accessToken) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return jsonResponse({ error: "Invalid or expired session." }, 401);
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonResponse({ error: "Content-Type must be application/json." }, 415);
    }

    const rawBody = await req.text();
    if (rawBody.length > 20_000) {
      return jsonResponse({ error: "Request is too large." }, 413);
    }

    const parsed = JSON.parse(rawBody) as { messages?: unknown };
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
      return jsonResponse({ error: "Messages array is required." }, 400);
    }

    const recentMessages = parsed.messages
      .filter((message): message is { role: string; text: string } => {
        if (!message || typeof message !== "object") return false;
        const value = message as Record<string, unknown>;
        return typeof value.role === "string" && typeof value.text === "string";
      })
      .slice(-12)
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        text: message.text.trim().slice(0, 2_000),
      }))
      .filter((message) => message.text.length > 0) as ChatMessage[];

    if (recentMessages.length === 0) {
      return jsonResponse({ error: "At least one valid message is required." }, 400);
    }

    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: recentMessages.map((message) => ({
        role: message.role,
        parts: [{ text: message.text }],
      })),
      generationConfig: {
        maxOutputTokens: 300,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
      ],
    };

    const geminiResponse = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!geminiResponse.ok) {
      console.error(`[ai-assistant] Gemini request failed for user ${user.id}:`, geminiResponse.status);
      return jsonResponse({ error: "The AI service is temporarily unavailable." }, 502);
    }

    const data = await geminiResponse.json();
    const blockedReason = data?.promptFeedback?.blockReason;
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    const finalReply =
      typeof reply === "string" && reply.trim()
        ? reply.trim()
        : blockedReason
          ? "I can't answer that one, but I'd love to help with something else! Try asking me about math, science, animals, or anything you're curious about."
          : "Hmm, I couldn't think of an answer right now. Can you try asking again?";

    return jsonResponse({ reply: finalReply });
  } catch (err) {
    console.error("[ai-assistant] unexpected error:", err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return jsonResponse({ error: message }, 500);
  }
});
