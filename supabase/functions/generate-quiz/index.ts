import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

interface QuizData {
  title: string;
  summary: string;
  key_entities: {
    people: string[];
    organizations: string[];
    locations: string[];
  };
  sections: string[];
  quiz: QuizQuestion[];
  related_topics: string[];
}

async function scrapeWikipedia(url: string): Promise<{ title: string; content: string; sections: string[] }> {
  console.log("Scraping Wikipedia URL:", url);
  
  // Extract article title from URL
  const urlMatch = url.match(/\/wiki\/(.+)$/);
  if (!urlMatch) {
    throw new Error("Invalid Wikipedia URL format");
  }
  
  const articleTitle = decodeURIComponent(urlMatch[1].replace(/_/g, " "));
  
  // Fetch the Wikipedia page
  const response = await fetch(url, {
    headers: {
      "User-Agent": "WikiQuizGenerator/1.0 (Educational Tool)",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Wikipedia page: ${response.status}`);
  }
  
  const html = await response.text();
  
  // Extract text content from HTML using regex (simplified parsing)
  // Remove script and style tags
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
  
  // Extract section headers
  const sectionMatches = content.match(/<h2[^>]*><span[^>]*class="mw-headline"[^>]*>([^<]+)<\/span>/gi) || [];
  const sections = sectionMatches
    .map(match => {
      const textMatch = match.match(/>([^<]+)<\/span>/);
      return textMatch ? textMatch[1].trim() : "";
    })
    .filter(s => s && !["See also", "References", "External links", "Notes", "Further reading"].includes(s));
  
  // Extract main content from mw-parser-output
  const mainContentMatch = content.match(/<div[^>]*class="mw-parser-output"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*id="catlinks"/i);
  if (mainContentMatch) {
    content = mainContentMatch[1];
  }
  
  // Remove HTML tags and clean up
  content = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\[\d+\]/g, "") // Remove citation numbers
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  // Limit content length for LLM
  const maxLength = 15000;
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + "...";
  }
  
  console.log(`Scraped content length: ${content.length}, sections: ${sections.length}`);
  
  return { title: articleTitle, content, sections };
}

async function generateQuizWithAI(title: string, content: string, sections: string[]): Promise<QuizData> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const systemPrompt = `You are an educational quiz generator. Given a Wikipedia article, you must generate a comprehensive quiz with high-quality questions. 

You MUST respond with a valid JSON object using this EXACT structure (no markdown, no code blocks, just pure JSON):
{
  "summary": "A 2-3 sentence summary of the article",
  "key_entities": {
    "people": ["list of important people mentioned"],
    "organizations": ["list of organizations mentioned"],
    "locations": ["list of locations mentioned"]
  },
  "quiz": [
    {
      "question": "Clear, specific question about the article content",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "The correct option (must match one of the options exactly)",
      "difficulty": "easy|medium|hard",
      "explanation": "Brief explanation of why this is the answer and where in the article it's mentioned"
    }
  ],
  "related_topics": ["3-5 related Wikipedia topics for further reading"]
}

Requirements:
- Generate 7-10 quiz questions
- Mix difficulty levels: 3 easy, 3-4 medium, 2-3 hard
- Questions should cover different sections and aspects of the article
- All answers must be factually correct based on the article content
- Related topics should be Wikipedia article titles`;

  const userPrompt = `Generate a quiz for the following Wikipedia article:

Title: ${title}

Sections: ${sections.join(", ")}

Content:
${content}

Generate the quiz JSON now:`;

  console.log("Calling Lovable AI for quiz generation...");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("API credits exhausted. Please add funds to continue.");
    }
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices?.[0]?.message?.content;
  
  if (!aiResponse) {
    throw new Error("No response from AI");
  }

  console.log("AI response received, parsing...");

  // Clean and parse the JSON response
  let jsonStr = aiResponse.trim();
  
  // Remove markdown code blocks if present
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    const parsed = JSON.parse(jsonStr);
    
    return {
      title,
      summary: parsed.summary || "",
      key_entities: parsed.key_entities || { people: [], organizations: [], locations: [] },
      sections,
      quiz: parsed.quiz || [],
      related_topics: parsed.related_topics || [],
    };
  } catch (parseError) {
    console.error("JSON parse error:", parseError, "Response:", jsonStr.substring(0, 500));
    throw new Error("Failed to parse AI response as JSON");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "Wikipedia URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate Wikipedia URL
    if (!url.includes("wikipedia.org/wiki/")) {
      return new Response(
        JSON.stringify({ success: false, error: "Please provide a valid Wikipedia URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing URL:", url);

    // Step 1: Scrape Wikipedia content
    const { title, content, sections } = await scrapeWikipedia(url);

    // Step 2: Generate quiz with AI
    const quizData = await generateQuizWithAI(title, content, sections);

    // Step 3: Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: savedQuiz, error: dbError } = await supabase
      .from("quizzes")
      .insert({
        url,
        title: quizData.title,
        summary: quizData.summary,
        key_entities: quizData.key_entities,
        sections: quizData.sections,
        quiz: quizData.quiz,
        related_topics: quizData.related_topics,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save quiz to database");
    }

    console.log("Quiz saved successfully with ID:", savedQuiz.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: savedQuiz,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating quiz:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});