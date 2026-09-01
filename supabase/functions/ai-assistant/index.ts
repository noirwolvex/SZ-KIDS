import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const recentMessages = messages.slice(-12);

    const contents: ChatMessage[] = recentMessages.map((m: { role: string; text: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      text: m.text,
    }));

    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: contents.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 300,
        topP: 0.95,
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
      const errText = await geminiResponse.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error (${geminiResponse.status}): ${errText}` }),
        { status: geminiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await geminiResponse.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Hmm, I couldn't think of an answer right now. Can you try asking again?";

    const blockedReason = data?.promptFeedback?.blockReason;
    const finalReply =
      blockedReason && !data?.candidates?.length
        ? "I can't answer that one, but I'd love to help with something else! Try asking me about math, science, animals, or anything you're curious about."
        : reply;

    return new Response(
      JSON.stringify({ reply: finalReply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Something went wrong." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
